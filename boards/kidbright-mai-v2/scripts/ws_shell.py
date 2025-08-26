import asyncio
import websockets
import os
import pty
import fcntl

async def pty_to_ws(pty_master_fd, websocket):
    """Reads from the PTY master and sends to the websocket."""
    loop = asyncio.get_event_loop()
    try:
        while not websocket.closed:
            # The executor will block on os.read until data is available,
            # without blocking the main asyncio event loop.
            data = await loop.run_in_executor(
                None, lambda: os.read(pty_master_fd, 1024)
            )
            if not data:
                print("PTY stream ended.")
                break
            await websocket.send(data)
    except websockets.exceptions.ConnectionClosed:
        # This is expected when the client disconnects.
        print(f"Client {websocket.remote_address} disconnected (pty_to_ws).")
    except Exception as e:
        print(f"An error occurred in pty_to_ws: {e}")
    finally:
        if not websocket.closed:
            await websocket.close()

async def ws_to_pty(websocket, pty_master_fd):
    """Receives messages from the websocket and writes to the PTY master."""
    loop = asyncio.get_event_loop()
    try:
        async for message in websocket:
            await loop.run_in_executor(None, lambda: os.write(pty_master_fd, message.encode('utf-8')))
    except websockets.exceptions.ConnectionClosed:
        # This is expected when the client disconnects.
        print(f"Client {websocket.remote_address} disconnected (ws_to_pty).")
    except Exception as e:
        print(f"An error occurred in ws_to_pty: {e}")

async def connection_handler(websocket, path):
    """Handles a new websocket connection by creating a shell process in a PTY."""
    client_addr = websocket.remote_address
    print(f"New client connected: {client_addr}")

    try:
        pid, master_fd = pty.fork()
    except Exception as e:
        print(f"Failed to fork PTY for {client_addr}: {e}")
        await websocket.close()
        return

    if pid == pty.CHILD:  # Child process
        try:
            # Start a new shell session
            os.execv("/bin/sh", ["/bin/sh"])
        except Exception as e:
            # This print will likely not be seen as stdout is the pty
            print(f"Failed to exec shell in child process: {e}")
            os._exit(1)
    else:  # Parent process
        print(f"PTY process created for {client_addr} with PID: {pid}")
        
        

        loop = asyncio.get_event_loop()
        
        ws_reader_task = asyncio.create_task(ws_to_pty(websocket, master_fd))
        pty_reader_task = asyncio.create_task(pty_to_ws(master_fd, websocket))

        done, pending = await asyncio.wait(
            [ws_reader_task, pty_reader_task],
            return_when=asyncio.FIRST_COMPLETED
        )

        for task in pending:
            task.cancel()

        try:
            os.kill(pid, 15)  # Send SIGHUP to the process group
            await asyncio.sleep(0.1)
            os.waitpid(pid, os.WNOHANG)
            print(f"Cleaned up PTY process {pid} for {client_addr}")
        except ProcessLookupError:
            pass  # Process already exited
        except Exception as e:
            print(f"Error during PTY cleanup for {client_addr}: {e}")
        finally:
            os.close(master_fd)

    print(f"Connection from {client_addr} closed.")

async def main():
    ip = "0.0.0.0"
    port = 5555

    print(f"Starting PTY WebSocket shell server on ws://{ip}:{port}")

    async with websockets.serve(connection_handler, ip, port):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServer stopped manually.")