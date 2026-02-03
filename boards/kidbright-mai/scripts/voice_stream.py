import socket
import threading, pickle, struct, random
import time
import os
import logging
import pyaudio
import wave
import sys
import signal
import audioop
# image drawing 
from PIL import Image, ImageDraw 
# mfcc
import numpy as np
import random
import numpy.linalg as la
from math import *
from numpy import append, zeros

def hamming2(n):
    return 0.54 - 0.46* np.cos(2*pi/n * np.arange(n))

CHUNK = 1024
WIDTH = 2
CHANNELS = 1
RATE = 44100
RECORD_SECONDS = 5
LISTEN_TIMEOUT = 5

WAVEFORM_WIDTH = 800
WAVEFORM_HEIGHT = 200

MFCC_WIDTH = 224
MFCC_HEIGHT = 224
FrameDuration = 0.040 # 40 ms
FrameLen = int(FrameDuration * RATE) # 1764 samples
FrameShift = int(FrameDuration * RATE / 2) # 882 samples
FFTLen = 2048
nFilters = 40
win = hamming2(FrameLen)
mfccCoefs = 13

class CtrlBreakInterrupt(BaseException):
    pass

def handler(*args):
    sys.exit(0)

signal.signal(signal.SIGTERM, handler)
signal.signal(signal.SIGINT, handler)

#=================================== MFCC ============================================

def mel(nFilters, FFTLen, sampRate): 
    halfFFTLen = int(floor(FFTLen/2)) 
    M = zeros((nFilters, halfFFTLen)) 
    lowFreq = 20 # Hz
    highFreq = 8000 # Hz
    melLowFreq = 1125*np.log(1+lowFreq/700.0)
    melHighFreq = 1125*np.log(1+highFreq/700.0)
    melStep = int(floor((melHighFreq - melLowFreq)/nFilters)) 
    melLow2High = np.arange(melLowFreq, melHighFreq, melStep) 
    #melLow2High = 1125*np.log(1+np.arange(lowFreq, highFreq)/700.0)
    HzLow2High = 700*(np.exp(melLow2High/1125)-1) 
    HzLow2HighNorm = np.floor(FFTLen*HzLow2High/sampRate)

    # form the triangular filters 
    for filt in range(nFilters):
        xStart1 = HzLow2HighNorm[filt] 
        xStop1 = HzLow2HighNorm[filt+1] 
        yStep1 = 1/(xStop1-xStart1) 
        M[filt, int(xStart1)] = 0.0;
        for x in np.arange(xStart1+1, xStop1): 
            M[filt, int(x)] = M[filt, int(x)-1] + yStep1
    for filt in range(nFilters-1):
        xStart2 = HzLow2HighNorm[filt+1]
        xStop2 = HzLow2HighNorm[filt+2] 
        yStep2 = -1.0/(xStop2-xStart2)
        M[filt, int(xStart2)] = 1.0;
        for x in np.arange(xStart2+1, xStop2):
            M[filt, int(x)] = M[filt, int(x)-1] + yStep2
    return melLow2High, HzLow2High, HzLow2HighNorm, M

def dctmtx(n):
  #DCT-II matrix
  x,y = np.meshgrid(range(n), range(n))
  D = np.sqrt(2.0/n) * np.cos(pi * (2*x+1) * y / (2*n)) 
  D[0] /= np.sqrt(2)
  return D

def doMfcc(signal):
    lenSig = len(signal)
    nFrames = int(floor((lenSig - FrameLen)/FrameShift) + 1)
    mfcc = zeros((nFrames, mfccCoefs))
    melLow2High, HzLow2High, HzLow2HighNorm, M = mel(nFilters, FFTLen, RATE)
    D = dctmtx(nFilters)
    for frame in range(nFrames):
        start = frame * FrameShift
        end = start + FrameLen
        frameSignal = signal[start:end] * win
        frameSpectrum = np.fft.fft(frameSignal, FFTLen)
        frameSpectrum = abs(frameSpectrum[:int(FFTLen/2)])
        frameSpectrum = frameSpectrum**2
        frameSpectrum = np.dot(M, frameSpectrum)
        frameSpectrum = np.log(frameSpectrum)
        frameSpectrum = np.dot(D, frameSpectrum)
        mfcc[frame] = frameSpectrum
    return mfcc

def doMfcc2(signal):
    lenSig = len(signal)
    nframes = int((lenSig - FrameLen) / FrameShift)
    nFilters = 40
    mfccCoefs = 13
    preEmphFactor = 0.95
    powSpec2D = np.zeros((FFTLen,nframes)) 
    mfcc2D = np.zeros((mfccCoefs,nframes))
    mfcc2DSpec = np.zeros((nFilters,nframes)) 
    mfcc2DPow = np.zeros((nFilters,nframes))
    melLow2High, HzLow2High, HzLow2HighNorm, M = mel(nFilters, FFTLen, RATE)
    D = dctmtx(nFilters)[1:mfccCoefs+1]
    invD = la.inv(dctmtx(nFilters))[:,1:mfccCoefs+1]
    minPowSpec = 1e-50

    for fr in range(0, nframes-1):
        start = fr*FrameShift
        currentFrame = signal[start:start+FrameLen]
        #--- pre-emphasis filtering
        #currentFrame[1:] -= currentFrame[:-1] * preEmphFactor
        
        currentFrame1 = currentFrame * win
        
        #--- pre-emphasis filtering
        currentFrame1[1:] -= currentFrame1[:-1] * preEmphFactor
        
        #--- fourier transform using numpy
        fftCurrentFrame = np.fft.fft(currentFrame1, FFTLen) 
        fftCurrentFrame[abs(fftCurrentFrame) < minPowSpec] = minPowSpec

        shiftedFFT = np.fft.fftshift(fftCurrentFrame)
        powSpec = 20*np.log(np.abs(shiftedFFT)) 

        #--- store current frame's power spectrum 
        powSpec2D[:,fr] = powSpec
        #mfcc2D[:, fr] = np.log(np.dot(M, np.abs(shiftedFFT)**2))
        mfcc2DPow[:, fr] = np.log(np.dot(M, np.abs(fftCurrentFrame[0:FFTLen//2])**2))
        mfcc2D[:, fr] = np.dot(D, mfcc2DPow[:,fr])
    return mfcc2D
#===============================================================================

def audio_stream():
  # create socket server
  server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  # bind the socket to an address and port or retry if it fails 10 times
  retry = 10
  while retry > 0:
    retry -= 1
    print(f"Trying to bind socket, {retry} retries left...")
    try:
      server_socket.bind(('0.0.0.0', 5000))
      break
    except OSError as e:
      print(f"Error binding socket: {e}")
      time.sleep(1)
    except Exception as e:
      print(f"Unexpected error: {e}")
      time.sleep(1)
      
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
        # init wave file
        wavefile = wave.open("kbvoice.wav", 'wb')
        wavefile.setnchannels(CHANNELS)
        wavefile.setsampwidth(p.get_sample_size(pyaudio.paInt16))
        wavefile.setframerate(RATE)        
        # init waveform image
        waveform = Image.new("RGB", (WAVEFORM_WIDTH, WAVEFORM_HEIGHT), "black")
        draw = ImageDraw.Draw(waveform)
        # init mfcc image
        mfcc = Image.new("RGB", (MFCC_WIDTH, MFCC_HEIGHT), "black")
        draw_mfcc = ImageDraw.Draw(mfcc)
        
        # listen with threshold
        threshold = data.decode().split(",")[1]
        record_sec = data.decode().split(",")[2]
        pixel_width = WAVEFORM_WIDTH / (int(RATE / CHUNK * int(record_sec)))
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
            # draw waveform red rectangle at the center of the image
            #rms_to_pixel = (rms / 32768) * WAVEFORM_HEIGHT
            #rms_to_pixel = rms_to_pixel / 2 # reduce height
            rms_to_pixel = rms / 2.5
            xy = [(i*pixel_width, WAVEFORM_HEIGHT/2 - rms_to_pixel), ((i+1)*pixel_width, WAVEFORM_HEIGHT/2 + rms_to_pixel)]
            draw.rectangle(xy, fill="red", outline="black", width=1)
            # send rms value to client
            client_socket.send(("#rm," + str(rms)).encode())
            wavefile.writeframes(data)
          wavefile.close()
          
          #write waveform image to file
          waveform.save("waveform.png")

          time.sleep(0.1)
          client_socket.send("#rec_stop\n".encode())
          time.sleep(0.1)
          client_socket.send("#process_start\n".encode())
          time.sleep(0.1)
          # read wave file
          wavefile = wave.open("kbvoice.wav", 'rb')
          signal = wavefile.readframes(-1)
          signal = np.frombuffer(signal, dtype=np.int16)
          # do MFCC
          mfcc = doMfcc2(signal)
          #print(mfcc.shape)
          #print(mfcc)
          #write mfcc image to file
          mfcc = mfcc * 255 / np.max(mfcc)
          mfcc = mfcc.astype(np.uint8)
          mfcc = Image.fromarray(mfcc)
          mfcc.save("mfcc.png")
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
