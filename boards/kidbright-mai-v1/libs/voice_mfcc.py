import struct, time, os, sys, signal
import pyaudio, wave
import audioop
# image drawing 
from PIL import Image, ImageDraw 
# mfcc
import numpy as np
import numpy.linalg as la
from math import *
from numpy import append, zeros

def hamming2(n):
    return 0.54 - 0.46* np.cos(2*pi/n * np.arange(n))

CHUNK = 1024
WIDTH = 2
CHANNELS = 1
RATE = 44100
LISTEN_TIMEOUT = 5

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
def start_stream():
  p = pyaudio.PyAudio()
  stream = p.open(format = p.get_format_from_width(WIDTH),
                  channels = CHANNELS,
                  rate = RATE,
                  input = True,
                  output = False)
  return p, stream

def stop_stream(stream, p):
  stream.stop_stream()
  stream.close()
  p.terminate()

def get_rms(stream):
  data = stream.read(CHUNK, exception_on_overflow = False)
  rms = audioop.rms(data, 2)    
  return rms

def audio_record(stream, p, record_sec):
  try:
    wavefile = wave.open("/root/app/voice_run.wav", 'wb')
    wavefile.setnchannels(CHANNELS)
    wavefile.setsampwidth(p.get_sample_size(pyaudio.paInt16))
    wavefile.setframerate(RATE)        
    for i in range(0, int(RATE / CHUNK * record_sec)):
      data = stream.read(CHUNK, exception_on_overflow = False)
      wavefile.writeframes(data)
    wavefile.close()
    #do MFCC
    wavefile = wave.open("/root/app/voice_run.wav", 'rb')
    signal = wavefile.readframes(-1)
    signal = np.frombuffer(signal, dtype=np.int16)
    wavefile.close()
    mfcc = doMfcc(signal)
    #print(mfcc.shape)
    #print(mfcc)
    #write mfcc image to file
    mfcc = mfcc * 255 / np.max(mfcc)
    mfcc = mfcc.astype(np.uint8)
    mfcc = Image.fromarray(mfcc)
    mfcc.save("/root/app/mfcc_run.png")
    time.sleep(0.1)
    
  except KeyboardInterrupt:
    print("KeyboardInterrupt")
  except CtrlBreakInterrupt:
    print("CtrlBreakInterrupt")
  except Exception as e:
    print("Exception")
    print(e)

def audio_listener(stream, p , threshold, record_sec):
  try:
    #check if msg is received and got command to start listening
    detected = False
    running = True
    while running:
      # init mfcc image
      mfcc = Image.new("RGB", (MFCC_WIDTH, MFCC_HEIGHT), "black")
      draw_mfcc = ImageDraw.Draw(mfcc)
      # listen within timeout
      start = time.time()
      while time.time() - start < LISTEN_TIMEOUT:
        data = stream.read(CHUNK, exception_on_overflow = False)
        rms = audioop.rms(data, 2)      
        print("RMS: ", rms)    
        # send rms value to client
        if rms > threshold:
          detected = True
          break
        
      print("Listening stopped")
      if detected:
        wavefile = wave.open("/root/app/voice_run.wav", 'wb')
        wavefile.setnchannels(CHANNELS)
        wavefile.setsampwidth(p.get_sample_size(pyaudio.paInt16))
        wavefile.setframerate(RATE)        

        for i in range(0, int(RATE / CHUNK * record_sec)):
          data = stream.read(CHUNK, exception_on_overflow = False)
          wavefile.writeframes(data)
        wavefile.close()
          
        wavefile = wave.open("/root/app/voice_run.wav", 'rb')
        signal = wavefile.readframes(-1)
        signal = np.frombuffer(signal, dtype=np.int16)
        wavefile.close()
        # do MFCC
        mfcc = doMfcc(signal)
          #print(mfcc.shape)
          #print(mfcc)
          #write mfcc image to file
        mfcc = mfcc * 255 / np.max(mfcc)
        mfcc = mfcc.astype(np.uint8)
        mfcc = Image.fromarray(mfcc)
        mfcc.save("/root/app/mfcc_run.png")
        time.sleep(0.1)
        
        print("Recording stopped")
          # send audio to client
        return True          
      else:
        print("No voice detected")
        return False
  except KeyboardInterrupt:
    print("KeyboardInterrupt")
  except CtrlBreakInterrupt:
    print("CtrlBreakInterrupt")
  except Exception as e:
    print("Exception")
    print(e)

if __name__ == '__main__':
  audio_stream()
