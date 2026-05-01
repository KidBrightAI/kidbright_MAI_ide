"""WebSocket-shell server for the KidBright IDE.

The IDE connects over wss:// and gets two channels multiplexed onto
the same socket:

  1. An interactive shell — the websocket frames marshal raw PTY
     bytes both ways. Anything the user types in the IDE terminal
     ends up at the shell; anything the shell prints comes back.
  2. A system control channel — IDE sends a single text frame
     starting with the `__SYSTEM__:` marker, body is a JSON command
     `{"cmd": "...", ...}`. Each command's response is a text frame
     `>>> System: <json>` (still a JSON object). The browser tells
     the two channels apart by frame type: text = system, binary =
     PTY output, so the parsers don't need brittle regex scrapes.
"""
import asyncio
import base64
import json
import os
import pty
import ssl
import subprocess

import websockets


WS_SHELL_VERSION = "1.3.0"
WS_SHELL_FEATURES = [
    "upload", "stat", "version", "listdir", "download",
    "wifi_scan", "wifi_status", "wifi_connect",
    "tcp_relay",
]
DOWNLOAD_CHUNK_SIZE = 256 * 1024
WIFI_IFACE = "wlan0"
WPA_CONF = "/etc/wpa_supplicant.conf"


# --------- system command handlers ---------
# Each handler receives the parsed JSON args dict and returns a JSON
# response object (or yields multiple, for streaming commands like
# download). The dispatcher in ws_to_pty walks the iterable.

async def _send(ws, payload):
    """Send one system response frame (text frame, JSON-shaped)."""
    await ws.send(f"\r\n>>> System: {json.dumps(payload)}\r\n")


async def cmd_upload(ws, args):
    path = args["path"]
    mode = args.get("mode", "wb")
    content = base64.b64decode(args["data"])
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(path, mode) as f:
        f.write(content)
    await _send(ws, {"type": "uploaded", "path": path})


async def cmd_stat(ws, args):
    path = args["path"]
    if os.path.exists(path):
        await _send(ws, {"type": "stat", "path": path,
                         "exists": True, "size": os.path.getsize(path)})
    else:
        await _send(ws, {"type": "stat", "path": path, "exists": False})


async def cmd_version(ws, _args):
    await _send(ws, {"type": "version",
                     "version": WS_SHELL_VERSION,
                     "features": WS_SHELL_FEATURES})


async def cmd_listdir(ws, args):
    path = args["path"]
    entries = []
    for name in sorted(os.listdir(path)):
        full = os.path.join(path, name)
        try:
            st = os.stat(full)
        except OSError:
            continue
        entries.append({
            "name": name,
            "type": "dir" if os.path.isdir(full) else "file",
            "size": st.st_size,
            "mtime": int(st.st_mtime),
        })
    await _send(ws, {"type": "listdir", "path": path, "entries": entries})


async def cmd_download(ws, args):
    path = args["path"]
    size = os.path.getsize(path)
    await _send(ws, {"type": "download_start", "path": path, "size": size})
    offset = 0
    with open(path, "rb") as f:
        while True:
            chunk = f.read(DOWNLOAD_CHUNK_SIZE)
            if not chunk:
                break
            await _send(ws, {
                "type": "download_chunk",
                "path": path,
                "offset": offset,
                "data": base64.b64encode(chunk).decode("ascii"),
            })
            offset += len(chunk)
    await _send(ws, {"type": "download_done", "path": path})


# --------- wifi handlers ---------
# wpa_cli wraps wpa_supplicant's local control socket. The IDE
# could shell-pipe these itself, but a JSON-shaped response keeps
# the client free of fragile output parsing.

def _wpa(*args):
    """Run `wpa_cli -i <iface> <args...>`, return stdout text."""
    return subprocess.run(
        ["wpa_cli", "-i", WIFI_IFACE, *args],
        capture_output=True, text=True,
    ).stdout


def _ensure_update_config():
    """wpa_cli's `save_config` is a no-op unless the running config
    has `update_config=1`. Stock Buildroot ships the file without
    it, so add the line on first connect (idempotent)."""
    try:
        with open(WPA_CONF) as f:
            content = f.read()
        if "update_config=1" in content:
            return
        with open(WPA_CONF, "w") as f:
            f.write("update_config=1\n" + content)
    except OSError as e:
        print(f"wpa conf patch failed: {e}")


def _parse_scan_results(stdout):
    """scan_results format: header line + tab-separated rows
    `bssid\tfrequency\tsignal\tflags\tssid`. Skip empty SSIDs and
    rows that don't have all 5 columns (header / blanks)."""
    rows = []
    for line in stdout.splitlines():
        parts = line.split("\t")
        if len(parts) != 5:
            continue
        bssid, freq, signal, flags, ssid = (p.strip() for p in parts)
        # Header line uses the literal "bssid" string in column 0.
        if bssid == "bssid" or not ssid:
            continue
        rows.append({
            "bssid": bssid, "frequency": freq, "signal": signal,
            "flags": flags, "ssid": ssid,
        })
    rows.sort(key=lambda n: int(n["signal"] or 0), reverse=True)
    return rows


def _parse_status(stdout):
    info = {}
    for line in stdout.splitlines():
        if "=" in line:
            k, v = line.split("=", 1)
            info[k.strip()] = v.strip()
    return info


async def cmd_wifi_scan(ws, _args):
    _wpa("scan")
    # scan_results may be empty for a brief moment after kicking off
    # a fresh scan; 2 s is generous enough for nearby APs to land.
    await asyncio.sleep(2)
    networks = _parse_scan_results(_wpa("scan_results"))
    await _send(ws, {"type": "wifi_scan", "networks": networks})


async def cmd_wifi_status(ws, _args):
    info = _parse_status(_wpa("status"))
    await _send(ws, {
        "type": "wifi_status",
        "connected": info.get("wpa_state") == "COMPLETED",
        "info": info,
    })


async def cmd_wifi_connect(ws, args):
    ssid = args.get("ssid", "")
    psk = args.get("psk", "")
    _ensure_update_config()
    nid = _wpa("add_network").strip()
    # Ssid + psk must be sent as quoted strings to wpa_cli so it
    # doesn't treat them as hex / network ids.
    _wpa("set_network", nid, "ssid", f'"{ssid}"')
    _wpa("set_network", nid, "psk",  f'"{psk}"')
    _wpa("enable_network", nid)
    # Poll up to 15 s for association + auth + DHCP. Stops at the
    # first success, gives up cleanly on timeout.
    success = False
    for _ in range(15):
        await asyncio.sleep(1)
        if _parse_status(_wpa("status")).get("wpa_state") == "COMPLETED":
            success = True
            break
    if success:
        _wpa("save_config")
    else:
        # Drop the broken entry so the next attempt isn't competing
        # with a known-bad network in wpa_supplicant's list.
        _wpa("remove_network", nid)
    await _send(ws, {"type": "wifi_connect", "success": success, "ssid": ssid})


# --------- tcp relay ---------
# A generic localhost-TCP forwarder so subsystem daemons (voice_stream,
# camera streamer, future...) keep listening on their own loopback ports
# and the IDE talks to them through the existing wss:// shell connection
# rather than exposing extra ports / TLS certs.
#
# Wire protocol:
#   IDE -> board:  cmd=tcp_relay_open, port=N         (one-shot)
#                  cmd=tcp_relay_send, data=<base64>  (write to socket)
#                  cmd=tcp_relay_close                (drop the socket)
#   board -> IDE:  type=tcp_relay_open, ok, error?, port?
#                  type=tcp_relay_data, data=<base64> (chunks read from socket)
#                  type=tcp_relay_closed              (socket EOF or close)
#
# Per-connection: at most one relay can be open at a time. State lives
# on the websocket object so each client cleans up independently.

async def cmd_tcp_relay_open(ws, args):
    if getattr(ws, "_kb_relay_task", None) and not ws._kb_relay_task.done():
        await _send(ws, {"type": "tcp_relay_open", "ok": False,
                         "error": "relay already open"})
        return
    port = int(args.get("port", 0))
    try:
        reader, writer = await asyncio.open_connection("127.0.0.1", port)
    except Exception as e:
        await _send(ws, {"type": "tcp_relay_open", "ok": False,
                         "error": str(e)})
        return
    ws._kb_relay_writer = writer

    async def pump():
        try:
            while True:
                chunk = await reader.read(4096)
                if not chunk:
                    break
                await _send(ws, {
                    "type": "tcp_relay_data",
                    "data": base64.b64encode(chunk).decode("ascii"),
                })
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"tcp_relay pump: {e}")
        finally:
            try:
                writer.close()
                await writer.wait_closed()
            except Exception:
                pass
            try:
                await _send(ws, {"type": "tcp_relay_closed"})
            except Exception:
                pass  # ws already gone

    ws._kb_relay_task = asyncio.create_task(pump())
    await _send(ws, {"type": "tcp_relay_open", "ok": True, "port": port})


async def cmd_tcp_relay_send(ws, args):
    writer = getattr(ws, "_kb_relay_writer", None)
    if writer is None:
        await _send(ws, {"type": "error", "message": "relay not open"})
        return
    try:
        data = base64.b64decode(args.get("data", ""))
        writer.write(data)
        await writer.drain()
    except Exception as e:
        await _send(ws, {"type": "error", "message": str(e)})


async def cmd_tcp_relay_close(ws, _args):
    task = getattr(ws, "_kb_relay_task", None)
    if task and not task.done():
        task.cancel()
    ws._kb_relay_task = None
    ws._kb_relay_writer = None


CMD_HANDLERS = {
    "upload":           cmd_upload,
    "stat":             cmd_stat,
    "version":          cmd_version,
    "listdir":          cmd_listdir,
    "download":         cmd_download,
    "wifi_scan":        cmd_wifi_scan,
    "wifi_status":      cmd_wifi_status,
    "wifi_connect":     cmd_wifi_connect,
    "tcp_relay_open":   cmd_tcp_relay_open,
    "tcp_relay_send":   cmd_tcp_relay_send,
    "tcp_relay_close":  cmd_tcp_relay_close,
}


async def handle_system_message(ws, raw):
    """Parse `__SYSTEM__:<json>` and dispatch to a handler. Errors
    come back as `{type: "error", message}` so the client always sees
    a JSON response no matter what went wrong."""
    try:
        args = json.loads(raw)
        cmd = args.get("cmd")
        handler = CMD_HANDLERS.get(cmd)
        if handler is None:
            await _send(ws, {"type": "error",
                             "message": f"unknown cmd: {cmd!r}"})
            return
        await handler(ws, args)
    except Exception as e:
        print(f"System command error: {e}")
        await _send(ws, {"type": "error", "message": str(e)})


# --------- ws <-> PTY plumbing ---------

async def pty_to_ws(pty_master_fd, websocket):
    """Read PTY bytes and forward as binary frames so the IDE can
    distinguish them from text-frame system messages."""
    loop = asyncio.get_event_loop()
    try:
        while not websocket.closed:
            data = await loop.run_in_executor(
                None, lambda: os.read(pty_master_fd, 1024)
            )
            if not data:
                print("PTY stream ended.")
                break
            await websocket.send(data)
    except websockets.exceptions.ConnectionClosed:
        print(f"Client {websocket.remote_address} disconnected (pty_to_ws).")
    except Exception as e:
        print(f"pty_to_ws: {e}")
    finally:
        if not websocket.closed:
            await websocket.close()


async def ws_to_pty(websocket, pty_master_fd):
    """Receive frames from the websocket. System control frames are
    handled in-process; everything else is forwarded to the PTY."""
    loop = asyncio.get_event_loop()
    try:
        async for message in websocket:
            if isinstance(message, str) and message.startswith("__SYSTEM__:"):
                await handle_system_message(websocket, message[len("__SYSTEM__:"):])
                continue

            data = message.encode("utf-8") if isinstance(message, str) else message
            await loop.run_in_executor(None, lambda: os.write(pty_master_fd, data))
    except websockets.exceptions.ConnectionClosed:
        print(f"Client {websocket.remote_address} disconnected (ws_to_pty).")
    except Exception as e:
        print(f"ws_to_pty: {e}")


# --------- connection lifecycle ---------

async def connection_handler(websocket, _path):
    client = websocket.remote_address
    print(f"New client connected: {client}")
    try:
        pid, master_fd = pty.fork()
    except Exception as e:
        print(f"PTY fork failed for {client}: {e}")
        await websocket.close()
        return

    if pid == pty.CHILD:
        try:
            os.execv("/bin/sh", ["/bin/sh"])
        except Exception as e:
            print(f"exec /bin/sh failed: {e}")
            os._exit(1)

    print(f"PTY {pid} spawned for {client}")
    ws_task = asyncio.create_task(ws_to_pty(websocket, master_fd))
    pty_task = asyncio.create_task(pty_to_ws(master_fd, websocket))

    _done, pending = await asyncio.wait(
        [ws_task, pty_task], return_when=asyncio.FIRST_COMPLETED,
    )
    for t in pending:
        t.cancel()

    # Drop any active TCP relay tied to this ws so the loopback socket
    # doesn't outlive the IDE connection (ws send in pump's finally
    # would just no-op against a closed ws, but the writer needs to
    # actually close to release fds on the daemon side).
    relay_task = getattr(websocket, "_kb_relay_task", None)
    if relay_task and not relay_task.done():
        relay_task.cancel()
    relay_writer = getattr(websocket, "_kb_relay_writer", None)
    if relay_writer is not None:
        try:
            relay_writer.close()
        except Exception:
            pass

    try:
        os.kill(pid, 15)        # SIGTERM the shell
        await asyncio.sleep(0.1)
        os.waitpid(pid, os.WNOHANG)
    except ProcessLookupError:
        pass
    except Exception as e:
        print(f"PTY cleanup error for {client}: {e}")
    finally:
        os.close(master_fd)

    print(f"Connection from {client} closed.")


async def main():
    ip, port = "0.0.0.0", 5050
    cert_path, key_path = "/root/cert.pem", "/root/key.pem"
    ssl_ctx = None
    if os.path.exists(cert_path) and os.path.exists(key_path):
        try:
            ssl_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            ssl_ctx.load_cert_chain(cert_path, key_path)
            print(f"SSL loaded — running as wss://")
        except Exception as e:
            print(f"SSL load failed, running as ws://: {e}")
            ssl_ctx = None
    else:
        print("No certs — running as ws://")

    print(f"ws_shell {WS_SHELL_VERSION} listening on {'wss' if ssl_ctx else 'ws'}://{ip}:{port}")
    async with websockets.serve(connection_handler, ip, port,
                                ssl=ssl_ctx, max_size=None):
        await asyncio.Future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServer stopped.")
