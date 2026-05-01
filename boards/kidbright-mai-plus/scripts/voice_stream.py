import socket
import threading, pickle, struct, random
import time
import os
import logging
import alsaaudio   # MaixCAM ships pyalsaaudio (0.10), not pyaudio
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

# Output paths fixed at /root so the IDE's readFile("/root/...") matches
# regardless of where the PTY shell's cwd happens to be (ws_shell.py's
# pty fork inherits cwd=/ from S99 init, so relative writes land at /).
WAV_PATH = "/root/kbvoice.wav"
WAVEFORM_PATH = "/root/waveform.png"
MFCC_PATH = "/root/mfcc.png"


def _log_mel_spec(signal):
  """Vectorized log-mel-spectrogram. Returns (NFILTERS=40, nframes) float64.

  Replaces the original per-frame doMfcc2 — that loop is ~50× slower on
  the single-core RISC-V because every frame allocates new arrays and
  numpy without BLAS does scalar FFT. This batched version computes one
  rfft over all frames at once and clamps zeros before log to avoid the
  NaN-cast warning when a mel filter row gets no power.
  """
  FrameLen = int(0.040 * 44100)        # 1764
  FrameShift = int(0.040 * 44100 / 2)  # 882
  FFTLen = 2048
  NFILTERS = 40
  nframes = int((len(signal) - FrameLen) / FrameShift)
  if nframes <= 1:
    return np.zeros((NFILTERS, max(nframes, 1)))
  M = mel(NFILTERS, FFTLen, 44100)[3]   # mel filterbank only (last tuple item)
  nz = np.any(M > 0, axis=0)
  first = int(np.argmax(nz))
  last  = int(len(nz) - np.argmax(nz[::-1]))
  M_T   = M[:, first:last].T.copy()
  win   = 0.54 - 0.46 * np.cos(2 * pi / FrameLen * np.arange(FrameLen))

  from numpy.lib.stride_tricks import as_strided
  s = signal.astype(np.float64, copy=False)
  stride = (s.strides[0] * FrameShift, s.strides[0])
  frames = as_strided(s, shape=(nframes, FrameLen), strides=stride).copy()
  frames *= win
  frames[:, 1:] -= frames[:, :-1] * 0.95          # pre-emphasis
  spec = np.fft.rfft(frames, FFTLen, axis=1)
  mag_sq = np.abs(spec[:, first:last]) ** 2
  mag_sq[mag_sq < 1e-50] = 1e-50
  return np.log(mag_sq @ M_T).T


def audio_stream():
  # create socket server. SO_REUSEADDR lets us bind even if the prior
  # daemon's socket is still in TIME_WAIT — the IDE's "kill old, start
  # new" pattern would otherwise hit ~60 s of EADDRINUSE.
  server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
  bound = False
  for attempt in range(10):
    try:
      server_socket.bind(('0.0.0.0', 5000))
      bound = True
      break
    except OSError as e:
      print(f"bind retry {attempt}: {e}", flush=True)
      time.sleep(1)
  if not bound:
    # Don't fall through to listen() on an unbound socket — that auto-
    # binds to an ephemeral port and the daemon "looks alive" while the
    # IDE keeps hitting ECONNREFUSED on 5000. Exit so init() retries.
    print("bind failed after 10 attempts — exiting", flush=True)
    sys.exit(1)

  server_socket.listen(5)
  print("Server listening on port 5000", flush=True)

  client_socket = None
  pcm = None

  def read_period():
    """Blocking read of one full period; skip empty/overrun returns."""
    for _ in range(8):
      length, raw = pcm.read()
      if length > 0 and raw:
        return raw
    return b""

  try:
    pcm = alsaaudio.PCM(
        type=alsaaudio.PCM_CAPTURE,
        mode=alsaaudio.PCM_NORMAL,
        rate=RATE, channels=CHANNELS,
        format=alsaaudio.PCM_FORMAT_S16_LE,
        periodsize=CHUNK,
    )

    client_socket, addr = server_socket.accept()

    while True:
      data = client_socket.recv(1024)
      if not data:
        break
      if data.decode().split(",")[0] != "#start":
        continue
      # listen with threshold
      threshold = int(data.decode().split(",")[1])
      record_sec = int(data.decode().split(",")[2])
      # init wave file
      wavefile = wave.open(WAV_PATH, 'wb')
      wavefile.setnchannels(CHANNELS)
      wavefile.setsampwidth(WIDTH)   # int16 = 2 bytes/sample
      wavefile.setframerate(RATE)
      # init waveform image
      waveform = Image.new("RGB", (WAVEFORM_WIDTH, WAVEFORM_HEIGHT), "black")
      draw = ImageDraw.Draw(waveform)
      pixel_width = WAVEFORM_WIDTH / (int(RATE / CHUNK * record_sec))

      # Voice-detection phase: stream RMS until threshold or timeout.
      detected = False
      start = time.time()
      while time.time() - start < LISTEN_TIMEOUT:
        raw = read_period()
        rms = audioop.rms(raw, 2)
        client_socket.send(("#uv," + str(rms)).encode())
        if rms > threshold:
          detected = True
          break

      if not detected:
        print("No voice detected")
        client_socket.send("#novoice".encode())
        wavefile.close()
        continue

      # Recording phase: record_sec of frames + waveform draw.
      client_socket.send("#rec_start".encode())
      for i in range(0, int(RATE / CHUNK * record_sec)):
        raw = read_period()
        rms = audioop.rms(raw, 2)
        rms_to_pixel = rms / 2.5
        xy = [(i*pixel_width, WAVEFORM_HEIGHT/2 - rms_to_pixel),
              ((i+1)*pixel_width, WAVEFORM_HEIGHT/2 + rms_to_pixel)]
        draw.rectangle(xy, fill="red", outline="black", width=1)
        client_socket.send(("#rm," + str(rms)).encode())
        wavefile.writeframes(raw)
      wavefile.close()
      waveform.save(WAVEFORM_PATH)

      time.sleep(0.1)
      client_socket.send("#rec_stop\n".encode())
      time.sleep(0.1)
      client_socket.send("#process_start\n".encode())
      time.sleep(0.1)
      # MFCC: vectorized log-mel-spec (40, nframes). Cosmetic only — the
      # trainer regenerates from the WAV via regen_melspec.py, so what
      # we save here is just a thumbnail for the dataset Annotate UI.
      wavefile = wave.open(WAV_PATH, 'rb')
      sigb = np.frombuffer(wavefile.readframes(-1), dtype=np.int16)
      wavefile.close()
      mel_spec = _log_mel_spec(sigb.astype(np.float64))
      lo, hi = mel_spec.min(), mel_spec.max()
      img8 = ((mel_spec - lo) * (255.0 / (hi - lo))).astype(np.uint8) if hi > lo \
              else np.zeros_like(mel_spec, dtype=np.uint8)
      Image.fromarray(img8).save(MFCC_PATH)
      time.sleep(0.1)
      client_socket.send("#process_stop\n".encode())

  except KeyboardInterrupt:
    print("KeyboardInterrupt")
  except CtrlBreakInterrupt:
    print("CtrlBreakInterrupt")
  except Exception as e:
    print("Exception")
    print(e)
  finally:
    if pcm is not None:
      try: pcm.close()
      except Exception: pass
    if client_socket is not None:
      try: client_socket.close()
      except Exception: pass
    try: server_socket.close()
    except Exception: pass


if __name__ == '__main__':
  audio_stream()
