"""Wrapper that the MaixCAM launcher invokes when this app is selected.

It spawns the user's Blockly-generated run.py as a child process, watches
the touchscreen for an exit gesture (top-left corner tap), and gracefully
terminates the child + returns control to the launcher.

The exit zone is intentionally invisible — overlaying it on top of the
user's display.show() output would race with their drawing. Until we
have a real per-frame overlay solution, the convention is "tap the
top-left corner to exit". A small calibration banner during startup
tells the user about it.
"""
import atexit
import os
import signal
import subprocess
import sys
import threading
import time

APP_DIR = os.path.dirname(os.path.abspath(__file__))
RUN_PY = os.path.join(APP_DIR, "run.py")
EXIT_ZONE = (0, 0, 60, 60)  # x, y, w, h — top-left corner

child_process = None


def cleanup():
    global child_process
    if child_process is not None and child_process.poll() is None:
        try:
            child_process.terminate()
            try:
                child_process.wait(timeout=2)
            except subprocess.TimeoutExpired:
                child_process.kill()
        except Exception:
            pass


atexit.register(cleanup)


def handle_signal(sig, _frame):
    cleanup()
    sys.exit(0)


signal.signal(signal.SIGINT, handle_signal)
signal.signal(signal.SIGTERM, handle_signal)


def watch_exit():
    try:
        from maix import touchscreen, app
    except ImportError:
        return
    ts = touchscreen.TouchScreen()
    while True:
        if app.need_exit():
            break
        try:
            x, y, pressed = ts.read()
        except Exception:
            time.sleep(0.05)
            continue
        ex_x, ex_y, ex_w, ex_h = EXIT_ZONE
        if pressed and ex_x <= x < ex_x + ex_w and ex_y <= y < ex_y + ex_h:
            app.set_exit_flag(True)
            break
        if child_process is not None and child_process.poll() is not None:
            break
        time.sleep(0.05)
    cleanup()


threading.Thread(target=watch_exit, daemon=True).start()

# Run the user's code as a child so a crash in their code doesn't kill the
# touchscreen watcher (which is what hands control back to the launcher).
child_process = subprocess.Popen([sys.executable, RUN_PY])
child_process.wait()
