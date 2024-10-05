import socket
import threading, wave, pyaudio, pickle, struct
import time
import os
import logging
import pyaudio
import wave
import sys
import signal
import audioop

CHUNK = 1024
WIDTH = 2
CHANNELS = 1
RATE = 44100
RECORD_SECONDS = 5

LISTEN_TIMEOUT = 5

class CtrlBreakInterrupt(BaseException):
    pass

def handler(*args):
    sys.exit(0)

signal.signal(signal.SIGTERM, handler)
signal.signal(signal.SIGINT, handler)

def audio_stream():
  # create socket server
  server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  server_socket.bind(('0.0.0.0', 5000))
  server_socket.listen(5)

  try:
    # set pyaudio
    p = pyaudio.PyAudio()
    stream = p.open(format = p.get_format_from_width(WIDTH),
                channels = CHANNELS,
                rate = RATE,
                input = True,
                output = False)
    
    print("Server listening on port 5000")
    client_socket, addr = server_socket.accept()
    
    #check if msg is received and got command to start listening
    detected = False
    while True:
      data = client_socket.recv(1024)
      if data.decode().split(",")[0] == "#start":
        # get threshold value
        wavefile = wave.open("kbvoice.wav", 'wb')
        wavefile.setnchannels(CHANNELS)
        wavefile.setsampwidth(p.get_sample_size(pyaudio.paInt16))
        wavefile.setframerate(RATE)        

        threshold = data.decode().split(",")[1]
        record_sec = data.decode().split(",")[2]
        #print("Listening... with threshold: " + threshold)
        # convert threshold to int
        threshold = int(threshold)
        record_sec = int(record_sec)
        # listen within timeout
        start = time.time()
        while time.time() - start < LISTEN_TIMEOUT:
          data = stream.read(CHUNK, exception_on_overflow = False)
          rms = audioop.rms(data, 2)          
          # send rms value to client
          client_socket.send(("#uv," + str(rms)).encode())
          if rms > threshold:
            detected = True
            break
        
        #print("Listening stopped")
        if detected:
          # record audio          
          client_socket.send("#rec_start".encode())          
          for i in range(0, int(RATE / CHUNK * record_sec)):
            data = stream.read(CHUNK, exception_on_overflow = False)
            rms = audioop.rms(data, 2)
            # send rms value to client
            client_socket.send(("#rm," + str(rms)).encode())
            wavefile.writeframes(data)
          wavefile.close()
          time.sleep(0.1)          
          client_socket.send("#rec_stop\n".encode())
          time.sleep(0.1)
          client_socket.send("#process_start\n".encode())
          time.sleep(0.1)          
          client_socket.send("#process_stop\n".encode())
          #print("Recording stopped")
          # send audio to client          
        else:
          print("No voice detected")          
          # send message to stop listening
          client_socket.send("#novoice".encode())
    # stop stream (4)
    stream.stop_stream()
    stream.close()

    # close PyAudio (5)
    p.terminate()
    client_socket.close()
    server_socket.close()
  except KeyboardInterrupt:
    print("KeyboardInterrupt")
    client_socket.close()
    server_socket.close()
  except CtrlBreakInterrupt:
    print("CtrlBreakInterrupt")
    client_socket.close()
    server_socket.close()
  except Exception as e:
    print("Exception")
    print(e)
    client_socket.close()
    server_socket.close()


if __name__ == '__main__':
  audio_stream()