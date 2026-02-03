import signal, sys

def handler_stop_signals(signum, frame):
    print("Exiting...")
    sys.exit(0)

signal.signal(signal.SIGINT, handler_stop_signals)
signal.signal(signal.SIGTERM, handler_stop_signals)

##{main}##
