"""Voice classification runtime for V831 — CPU numpy fp32 path.

Replaces the broken AWNN int8 path for voice on kidbright-mai (the V831
NPU quantizer collapses small-vocab voice models at inference time
regardless of training or calibration). Instead we load a float32 .npz
weight bundle and run the forward pass in numpy on the A7 Cortex, which
is slow in theory (no BLAS in stock numpy on this board) but fast enough
for keyword spotting: ~55–200 ms per clip depending on duration and
channel widths used at training.

Public API (used by generators_ai.js):

    import voice_cpu_infer as vci
    _model = vci.Model("/root/model/<hash>.npz")
    result = _model.classify(duration=3)
    # result = {"label": "forward", "prob": 0.98, "logits": [...], "index": 1}
    _model.close()
"""
import atexit
import os
from math import pi, floor

import numpy as np


# ---- DSP config (must match regen_melspec.py on the training server) ----
RATE = 44100
CHUNK = 1024
WIDTH = 2
CHANNELS = 1
FrameDuration = 0.040
FrameLen = int(FrameDuration * RATE)          # 1764
FrameShift = int(FrameDuration * RATE / 2)    # 882
FFTLen = 2048
NFILTERS = 40


def _hamming(n):
    return 0.54 - 0.46 * np.cos(2 * pi / n * np.arange(n))


_WIN = _hamming(FrameLen)


def _mel_filterbank(nFilters, FFTLen, sampRate):
    halfFFTLen = int(floor(FFTLen / 2))
    M = np.zeros((nFilters, halfFFTLen))
    melLow = 1125 * np.log(1 + 20 / 700.0)
    melHigh = 1125 * np.log(1 + 8000 / 700.0)
    melStep = int(floor((melHigh - melLow) / nFilters))
    melL2H = np.arange(melLow, melHigh, melStep)
    HzN = np.floor(FFTLen * (700 * (np.exp(melL2H / 1125) - 1)) / sampRate)
    for f in range(nFilters):
        x1, x2 = HzN[f], HzN[f + 1]
        if x2 <= x1:
            continue
        y1 = 1 / (x2 - x1)
        M[f, int(x1)] = 0.0
        for x in np.arange(x1 + 1, x2):
            M[f, int(x)] = y1 * (x - x1)
        if f < nFilters - 1:
            x3 = HzN[f + 2]
            if x3 <= x2:
                continue
            y2 = 1 / (x2 - x3)
            for x in np.arange(x2, x3 + 1):
                if int(x) < halfFFTLen:
                    M[f, int(x)] = y2 * (x - x3)
    return M


_MEL_FULL = _mel_filterbank(NFILTERS, FFTLen, RATE)
_nz = np.any(_MEL_FULL > 0, axis=0)
_MEL_FIRST = int(np.argmax(_nz))
_MEL_LAST = int(len(_nz) - np.argmax(_nz[::-1]))
_MEL_M_T = _MEL_FULL[:, _MEL_FIRST:_MEL_LAST].T.copy()


def _mel_spec(signal):
    """Vectorized log-mel-spectrogram using a single rfft call across frames."""
    nframes = int((len(signal) - FrameLen) / FrameShift)
    if nframes <= 1:
        return np.zeros((NFILTERS, max(nframes, 1)))
    from numpy.lib.stride_tricks import as_strided
    s = signal.astype(np.float64, copy=False)
    stride = (s.strides[0] * FrameShift, s.strides[0])
    frames = as_strided(s, shape=(nframes, FrameLen), strides=stride).copy()
    frames *= _WIN
    frames[:, 1:] -= frames[:, :-1] * 0.95
    spec = np.fft.rfft(frames, FFTLen, axis=1)
    mag_sq = np.abs(spec[:, _MEL_FIRST:_MEL_LAST]) ** 2
    mag_sq[mag_sq < 1e-50] = 1e-50
    return np.log(mag_sq @ _MEL_M_T).T


# ---- numpy CNN forward ----
def _im2col(x, kh, kw, stride=1):
    from numpy.lib.stride_tricks import as_strided
    C, H, W = x.shape
    H_out = (H - kh) // stride + 1
    W_out = (W - kw) // stride + 1
    sc, sh, sw = x.strides
    patches = as_strided(
        x, shape=(C, kh, kw, H_out, W_out),
        strides=(sc, sh, sw, sh * stride, sw * stride),
    )
    return patches.reshape(C * kh * kw, H_out * W_out).copy()


def _conv2d(x, W, b, pad=1):
    C_in, H, Wd = x.shape
    C_out, _, kh, kw = W.shape
    xp = np.pad(x, ((0, 0), (pad, pad), (pad, pad))) if pad else x
    cols = _im2col(xp, kh, kw)
    Wf = W.reshape(C_out, -1)
    y = Wf @ cols + b[:, None]
    return y.reshape(C_out, H, Wd)


def _maxpool2d(x, k):
    C, H, W = x.shape
    Ho, Wo = H // k, W // k
    x = x[:, :Ho * k, :Wo * k].reshape(C, Ho, k, Wo, k)
    return x.max(axis=(2, 4))


def _maxpool_global(x, kh, kw):
    return x.reshape(x.shape[0], -1).max(axis=1, keepdims=True)[:, :, None]


def _relu(x):
    return np.maximum(x, 0)


def _softmax(v):
    vmax = np.max(v)
    e = np.exp(v - vmax)
    return e / e.sum()


def _forward(x, w):
    """VoiceCNN forward. Global-pool kernel auto-inferred from feature map shape."""
    x = _relu(_conv2d(x, w["features.0.weight"], w["features.0.bias"], pad=1))
    x = _maxpool2d(x, 2)
    x = _relu(_conv2d(x, w["features.3.weight"], w["features.3.bias"], pad=1))
    x = _maxpool2d(x, 2)
    x = _relu(_conv2d(x, w["features.6.weight"], w["features.6.bias"], pad=1))
    x = _maxpool2d(x, 2)
    x = _maxpool_global(x, x.shape[1], x.shape[2])
    if "features.10.weight" in w:
        x = _relu(_conv2d(x, w["features.10.weight"], w["features.10.bias"], pad=0))
    x = x.flatten()
    return w["classifier.1.weight"] @ x + w["classifier.1.bias"]


def _preprocess_mel(mel_spec):
    """mel-spec float (H, W) -> (3, H, W) float32 in [-1,1] matching training Normalize."""
    lo, hi = mel_spec.min(), mel_spec.max()
    if hi > lo:
        mel_u8 = ((mel_spec - lo) * (255.0 / (hi - lo))).astype(np.uint8)
    else:
        mel_u8 = np.zeros_like(mel_spec, dtype=np.uint8)
    a = mel_u8.astype(np.float32)
    a = np.stack([a, a, a], axis=0)
    return (a - 127.5) / 128.0


class Model:
    """Voice classifier. Loads weights + owns the pyaudio input stream."""
    def __init__(self, npz_path):
        d = np.load(npz_path, allow_pickle=True)
        self.weights = {k: d[k] for k in d.files if k != "labels"}
        self.labels = [str(x) for x in d["labels"]]
        self._pa = None
        self._stream = None
        atexit.register(self.close)

    def _ensure_stream(self):
        if self._stream is not None:
            return
        import pyaudio
        self._pa = pyaudio.PyAudio()
        self._stream = self._pa.open(
            format=self._pa.get_format_from_width(WIDTH),
            channels=CHANNELS, rate=RATE, input=True,
            frames_per_buffer=CHUNK,
        )
        self._stream.read(CHUNK, exception_on_overflow=False)

    def record(self, duration):
        """Record `duration` seconds of mono 16-bit audio. Returns np.float64 signal."""
        self._ensure_stream()
        n_chunks = int(RATE / CHUNK * duration)
        # drain a couple buffered chunks so we start clean
        for _ in range(3):
            self._stream.read(CHUNK, exception_on_overflow=False)
        buf = []
        for _ in range(n_chunks):
            buf.append(self._stream.read(CHUNK, exception_on_overflow=False))
        return np.frombuffer(b"".join(buf), dtype=np.int16).astype(np.float64)

    def classify(self, duration=3.0):
        """Record + classify in one call. Returns dict with label/prob/logits/index."""
        sig = self.record(duration)
        mel = _mel_spec(sig)
        x = _preprocess_mel(mel)
        logits = _forward(x, self.weights)
        idx = int(np.argmax(logits))
        probs = _softmax(logits)
        return {
            "label": self.labels[idx],
            "prob": float(probs[idx]),
            "logits": logits.tolist(),
            "probs": probs.tolist(),
            "index": idx,
        }

    def close(self):
        if self._stream is not None:
            try:
                self._stream.stop_stream(); self._stream.close()
            except Exception:
                pass
            self._stream = None
        if self._pa is not None:
            try:
                self._pa.terminate()
            except Exception:
                pass
            self._pa = None
