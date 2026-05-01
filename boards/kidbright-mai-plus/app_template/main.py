"""Wrapper that the MaixCAM launcher invokes when this app is selected.

Just spawns the user's run.py as a child process and waits. The
visible exit button is drawn by run_template.py via a monkey-patch
on display.Display.show — keeping the touchscreen ownership in a
single process avoids the "two processes can't open the same touch
device" race.

If the user's code never calls disp.show() (e.g. headless), the
only way out is SSH or a reboot. We accept that for v1.
"""
import atexit
import os
import signal
import subprocess
import sys

APP_DIR = os.path.dirname(os.path.abspath(__file__))
RUN_PY = os.path.join(APP_DIR, "run.py")

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


def handle_signal(_sig, _frame):
    cleanup()
    sys.exit(0)


signal.signal(signal.SIGINT, handle_signal)
signal.signal(signal.SIGTERM, handle_signal)


child_process = subprocess.Popen([sys.executable, RUN_PY])
child_process.wait()
