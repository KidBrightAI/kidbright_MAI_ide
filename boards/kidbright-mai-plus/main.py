import signal, sys, os, atexit

def kill_system_app():
    # Kill any process containing 'maixapp/apps' but exclude 'launcher_daemon'
    cmd = "ps | grep maixapp/apps | grep -v grep"
    try:
        with os.popen(cmd) as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) > 0 and parts[0].isdigit():
                    pid = parts[0]
                    content = line[line.find(pid)+len(pid):].strip()
                    print(f"Killing {content} (PID: {pid})")
                    os.system(f"kill -9 {pid}")
    except Exception as e:
        print(f"Error killing system apps: {e}")

kill_system_app()

def start_system_app():
    print("Starting system app...")
    os.system("/maixapp/apps/launcher/launcher daemon &")

atexit.register(start_system_app)

def handler_stop_signals(signum, frame):
    print("Exiting...")
    sys.exit(0)

signal.signal(signal.SIGINT, handler_stop_signals)
signal.signal(signal.SIGTERM, handler_stop_signals)

##{main}##
