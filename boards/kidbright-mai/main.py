import signal, sys
from maix import camera

camera.camera.config(size=(224, 224))

def handler_stop_signals(signum, frame):
    print("Exiting...")
    sys.exit(0)

signal.signal(signal.SIGINT, handler_stop_signals)
signal.signal(signal.SIGTERM, handler_stop_signals)

##{main}##
