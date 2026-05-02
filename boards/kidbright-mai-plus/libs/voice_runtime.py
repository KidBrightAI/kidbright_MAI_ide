"""Voice classification runtime for MaixCAM (CV181x) — NPU cvimodel path.

Loads the trained voice CNN as a `.cvimodel` (compiled by tpu-mlir from the
ONNX export) and runs forward on the CV181x NPU via `maix.nn.Classifier`.
~1-3 ms NPU forward vs ~6 s of pure-numpy CNN on the RISC-V A53 CPU
(no BLAS, no SIMD).

Audio capture uses pyalsaaudio (the library the MaixCAM image actually ships
with — pyaudio is not installed). Mel-spec is computed in numpy on the CPU
because the audio chain is shorter than NPU forward; only the conv layers
benefit from offloading.

Public API (used by generators_ai.js):

    import voice_runtime
    _model = voice_runtime.Model("/root/model/<hash>.mud")
    result = _model.classify(duration=3)
    # result = {"label": "forward", "probability": 0.98, "class_id": 1}
    _model.close()

Result keys (`label` / `probability` / `class_id`) line up with the block
dropdown in maix3_nn_voice_get_result.
"""
import atexit
from math import pi, floor

import numpy as np


# ---- DSP config (must match regen_melspec.py on the training server) ----
RATE = 44100
CHUNK = 1024
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


def _mel_to_image(mel_spec):
    """Mel-spec (40, N) float -> (W=N, H=40, 3-channel RGB) maix.image.Image.

    Matches regen_melspec.py: per-clip min/max normalize to 0-255 uint8, then
    replicate the grayscale plane to 3 channels (training used Grayscale(3)
    + ImageFolder, so the network sees identical R/G/B planes).
    """
    from maix import image
    lo, hi = mel_spec.min(), mel_spec.max()
    if hi > lo:
        u8 = ((mel_spec - lo) * (255.0 / (hi - lo))).astype(np.uint8)
    else:
        u8 = np.zeros_like(mel_spec, dtype=np.uint8)
    H, W = u8.shape
    rgb = np.repeat(u8[..., None], 3, axis=-1).tobytes()
    return image.from_bytes(W, H, image.Format.FMT_RGB888, rgb)


class Model:
    """Voice classifier. Owns the ALSA capture handle + nn.Classifier."""
    def __init__(self, mud_path):
        from maix import nn
        self._classifier = nn.Classifier(model=mud_path, dual_buff=True)
        self.labels = list(self._classifier.labels)
        self._pcm = None
        atexit.register(self.close)

    def _ensure_stream(self):
        if self._pcm is not None:
            return
        import alsaaudio
        self._pcm = alsaaudio.PCM(
            type=alsaaudio.PCM_CAPTURE,
            mode=alsaaudio.PCM_NORMAL,
            rate=RATE, channels=CHANNELS,
            format=alsaaudio.PCM_FORMAT_S16_LE,
            periodsize=CHUNK,
        )

    def _read_chunk(self):
        """Blocking read of one period. Skip empty/overrun returns."""
        for _ in range(8):
            length, data = self._pcm.read()
            if length > 0 and data:
                return data
        return b""

    def record(self, duration):
        """Record `duration` seconds of mono 16-bit audio. Returns float64 np array."""
        self._ensure_stream()
        n_chunks = int(RATE / CHUNK * duration)
        for _ in range(3):
            self._read_chunk()
        buf = []
        for _ in range(n_chunks):
            buf.append(self._read_chunk())
        return np.frombuffer(b"".join(buf), dtype=np.int16).astype(np.float64)

    def get_rms(self):
        """Read one period from the mic and return its RMS as an int.

        Lazy-opens the ALSA stream on first call so a student can poll
        get_rms() in a loop (e.g. to threshold-trigger a recording)
        without paying for the open until they actually want audio.
        Same scale as audioop.rms(buf, 2): 0..32768 for int16 PCM.
        """
        self._ensure_stream()
        import audioop
        data = self._read_chunk()
        if not data:
            return 0
        return audioop.rms(data, 2)

    def classify(self, duration=3.0):
        """Record + classify in one call. Returns {label, probability, class_id}."""
        sig = self.record(duration)
        mel = _mel_spec(sig)
        img = _mel_to_image(mel)
        results = self._classifier.classify(img)
        if not results:
            return {"label": "None", "probability": 0.0, "class_id": -1}
        cid, prob = results[0]
        cid = int(cid)
        return {
            "label": self.labels[cid] if cid < len(self.labels) else str(cid),
            "probability": float(prob),
            "class_id": cid,
        }

    def close(self):
        if self._pcm is not None:
            try:
                self._pcm.close()
            except Exception:
                pass
            self._pcm = None
