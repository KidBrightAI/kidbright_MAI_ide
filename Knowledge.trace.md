# KidBright mAI IDE - Complete System Trace

## Voice Classification Pipeline (End-to-End)

### 1. Audio Capture (Board-Side)

**File:** `boards/kidbright-mai/scripts/voice_stream.py`

- Board runs TCP socket server on port 5000 via `voice_stream.py`
- Browser connects through ADB TCP forwarding: `adb.createSocket("tcp:5000")`
- Audio captured via PyAudio: 44100Hz, mono, 16-bit, 1024 chunk

**Socket Protocol (text-based):**
| Direction | Message | Meaning |
|-----------|---------|---------|
| Browser->Board | `#start,{threshold},{seconds}\n` | Start listening |
| Board->Browser | `#uv,{rms}` | Volume meter during listening |
| Board->Browser | `#rec_start` | Sound detected, recording |
| Board->Browser | `#rm,{rms}` | Waveform data during recording |
| Board->Browser | `#rec_stop` | Recording finished |
| Board->Browser | `#process_start` | Computing MFCC |
| Board->Browser | `#process_stop` | Done, files ready to pull |
| Board->Browser | `#novoice` | Timeout, no sound detected |

**Files generated on board:**
- `kbvoice.wav` - raw audio
- `waveform.png` - waveform visualization (800x200 RGB)
- `mfcc.png` - MFCC spectrogram (13 x nFrames, grayscale)

### 2. MFCC Computation (Board-Side)

**Function:** `doMfcc2()` in `voice_stream.py` (used for training data capture)

Parameters:
- Frame Duration: 40ms (1764 samples @ 44100Hz)
- Frame Shift: 882 samples (50% overlap)
- FFT Length: 2048
- Mel Filterbank: 40 triangular filters (20Hz - 8000Hz)
- MFCC Coefficients: 13

Pipeline:
```
Raw Audio (Int16 PCM) -> Frame Division (40ms, 50% overlap)
-> Hamming Window -> Pre-emphasis (0.95) -> FFT(2048)
-> |FFT[0:1024]|^2 -> Mel Filterbank (40 filters)
-> Log Power -> DCT-II [1:14] -> 13 coefficients per frame
```

Output: shape (13, nFrames) normalized to uint8 [0,255], saved as PNG

**IMPORTANT - Transpose mismatch:**
- `doMfcc2()` outputs (13, nFrames) - used in voice_stream.py for training capture
- `doMfcc()` outputs (nFrames, 13) - used in voice_mfcc.py for runtime inference
- This means training data and inference data have transposed MFCC representations

### 3. Browser-Side Capture (AdbSoundCapture.vue)

**File:** `src/components/InputConnection/AdbSoundCapture.vue`

Flow:
1. Kills existing python3 processes on board
2. Runs `python3 scripts/voice_stream.py &` on board via ADB shell
3. Opens ADB socket to tcp:5000 on device
4. Sends `#start,{threshold},{seconds}` command
5. Receives stream events, draws waveform/UV on canvas in real-time
6. On `#process_stop`: pulls 3 files via ADB sync
7. Emits `recorded` event with {sound: wav blob, mfcc: mfcc blob, preview: waveform blob}

Dataset storage (per sample):
- `${projectId}/${id}.png` - waveform image
- `${projectId}/${id}.wav` - audio file
- `${projectId}/${id}_mfcc.png` - MFCC image

### 4. Dataset Packaging (VoiceClassificationStrategy.js)

ZIP structure sent to Colab:
```
dataset/
  waveform/{label}/{id}.png
  sound/{label}/{id}.wav
  mfcc/{label}/{id}_mfcc.png     <-- Backend uses ONLY this folder
```

### 5. Backend Training (train_voice_classification.py)

- Loads MFCC PNGs from `dataset/mfcc/{label}/` via `ImageFolder`
- Splits train/val by moving files (80/20 default)
- Transforms: ToTensor() + Normalize(ImageNet mean/std)
- MFCC PNG (grayscale) loaded as RGB 3-channel by PIL/torchvision
- Input shape to model: (3, H, W) where H=13, W=nFrames

Model options:
- VoiceCnn (custom, from trainConfig.code string, uses eval())
- ResNet18/34/50/101/152 (pretrained ImageNet, replace fc layer)

Default architecture (from model-graph.json):
```
Conv2d(3->5, k=5, ReLU) -> MaxPool(2) -> Conv2d(5->5, k=3, ReLU) -> MaxPool(2)
-> Flatten -> Dense(50, ReLU) -> LazyLinear(num_classes)
```

Training: CrossEntropyLoss + Adam, 200 epochs, lr=0.001, warm-up 6 epochs
Output: best_acc.pth

### 6. Model Conversion

For kidbright-mai: PyTorch -> ONNX -> NCNN -> INT8 quantization (.bin + .param)
For kidbright-mai-plus: PyTorch -> ONNX -> MLIR (tpu-mlir) -> cvimodel + .mud

Voice model input_size hardcoded to [147, 13] during conversion.

### 7. Runtime Inference (Board)

voice_mfcc.py provides:
- `start_stream()` / `stop_stream()` - PyAudio management
- `get_rms()` - volume level
- `audio_listener()` - threshold-based voice detection
- `audio_record()` - record + MFCC + save mfcc_run.png
- Model loaded by maix.nn runtime, classifies MFCC image

---

## Known Issues

### MFCC Transpose Mismatch
- Training capture (doMfcc2): output shape (13, nFrames)
- Runtime inference (doMfcc): output shape (nFrames, 13)
- Potential accuracy issue if model expects one orientation

### VoiceCnn eval() Security
- models/voice_cnn.py line 21: `self.pred = eval("nn.Sequential(" + code + ")")`
- Code string comes from frontend trainConfig.code
- Could execute arbitrary Python if untrusted input

### Voice Model Input Size Hardcoded
- main.py line 220: `input_size = [147, 13]` hardcoded
- Actual MFCC size depends on recording duration (configurable in config.js)
- 3s @ 44100Hz -> ~148 frames, but conversion assumes 147

---

## Web-ADB Connection Bug (Vue Proxy + Private Fields)

### Error
```
TypeError: Cannot read private member #banner from an object whose class did not declare it
```

### Root Cause
SingletonShell.js constructor line 28 uses the original `adb` parameter (which may be a
Vue reactive Proxy) to call `adb.subprocess.shell()`. ES2022 private fields (#banner,
#dispatcher in @yume-chan/adb transport) are bound to the original class instance, not
accessible through Proxy objects.

Although lines 13-16 do `toRaw(adb)` and store it in `this.adb`, line 28 still
references the `adb` parameter directly instead of `this.adb`.

### Fix
Change line 28 from `adb.subprocess.shell()` to `this.adb.subprocess.shell()`

---

## Architecture Summary

### Pages
- index.vue (776 lines) - Main IDE: Header + Blockly + Terminal
- ai.vue (124 lines) - AI Training: 4-step workflow (Capture -> Annotate -> Train -> Deploy)

### Pinia Stores (6)
| Store | Persisted | Purpose |
|-------|-----------|---------|
| workspace | Yes | Project state, code, blocks, labels, trainConfig, model |
| board | No | Connection state, protocol handler |
| dataset | Yes | Dataset items with images/audio/annotations |
| plugin | Yes | Installed plugins list |
| project | No | Project metadata |
| server | No | Colab server, training state, SSE events |

### Communication Protocols
| Protocol | Board | Transport | Code Upload | Model Upload |
|----------|-------|-----------|-------------|--------------|
| web-adb | kidbright-mai | WebUSB | ADB sync file | ADB sync + hash cache |
| websocket | kidbright-mai-plus | ws:// binary | Command.Run packet | Not implemented |
| websocket-shell | kidbright-mai-plus | wss:// PTY | Chunked base64 JSON | Chunked 256KB + hash |

### AI Extensions (3)
| Extension | Model | Default Arch | Epochs |
|-----------|-------|-------------|--------|
| ImageClassification | MobileNet/ResNet | MobileNet-100 | 50 |
| ObjectDetection | YOLO v2/11n/11s | Slim YOLO v2 | 100 |
| VoiceClassification | Custom CNN/ResNet | Conv->Pool->Conv->Pool->Flatten->Dense | 200 |

### Colab Server API
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /ping | GET | Status + training stage (0-5) |
| /listen | EventSource | SSE: epoch/batch progress |
| /upload | POST | Upload project ZIP |
| /train | POST | Start training |
| /convert | GET | Convert model to board format |
| /projects/{id}/output/{file} | GET | Download model |
| /terminate_training | POST | Stop training |
