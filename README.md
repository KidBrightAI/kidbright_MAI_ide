# KidBright mAI IDE

**KidBright mAI (Micro AI) IDE** -- web-based integrated development environment for KidBright mAI and mAI Plus boards. Users author logic using **Blockly** visual programming, generate Python code, train AI models via Google Colab, and deploy to hardware -- all from the browser.

---

## Version

Current release: **1.1.2** (2026-05-02). Live at <https://kidbright-mai.web.app>.

### 1.1.2 — project-type label backfill for existing users

**Fixed**
- 1.1.1 fixed `NewModelDialog` so newly-created projects get a real `projectTypeTitle`, but existing users had `projectTypeTitle = null` already persisted in localStorage from before the fix — Pinia's persisted state stuck around so they kept seeing the "ไม่ได้เลือกประเภทโปรเจค" header even after the upgrade. `SidePanel` now falls back to `workspaceStore.extension?.name` (which was always persisted correctly) so returning users see the right title without having to delete + recreate the project.

### 1.1.1 — voice get_rms + project-type label

**Fixed**
- mAI Plus voice `get_rms` block: emitted literal `0` because `voice_runtime.Model` never kept a mic stream around outside of `classify()`. Added a lazy-opening `get_rms()` helper that returns `audioop.rms()` of one period (~23 ms) so threshold-trigger loops work like they do on V1.
- Model designer side panel header always read "ยังไม่ได้เลือกประเภทโปรเจค" even right after picking a model type. `NewModelDialog` was reading `.name` on a Vue `computed()` Ref (auto-unwrap is template-only, plain JS gets `undefined`); switched to `.value.name`.

**Changed**
- `/deploy` slash command (`.claude/commands/deploy.md`) gained a Tag + GitHub release step — every release now annotates a `vX.Y.Z` tag and posts the README's section as a GitHub release body.

### 1.1.0 — mAI Plus: WiFi + voice + auto-sync

**Added**
- mAI Plus (CV181x) WiFi support — scan / status / connect via wpa_cli wrappers in `ws_shell.py` 1.3.0; state auto-syncs on IDE connect; SSID + IP shown in the Header tooltip.
- mAI Plus voice classification end-to-end:
    - Inference: `voice_runtime.py` wraps `maix.nn.Classifier(.mud)` over the CV181x NPU (~1-3 ms forward, ~3000× faster than the numpy fallback).
    - Training-time capture: `WsShellSoundCapture.vue` talks to the on-board `voice_stream.py` daemon through a new generic `tcp_relay` command in ws_shell, replacing the V1-only ADB TCP forwarding.
    - Server (`kidbright_MAI_server`) compiles voice CNN to cvimodel via tpu-mlir with the trainer's actual mean/scale (not the leftover ImageNet defaults) and auto-detects the input W from the dataset wavs.
- mAI Plus board script auto-sync — every IDE connect rewrites `/root/scripts/*.py` plus `ws_shell.py` and `S99ws_shell` from the bundled `boards/kidbright-mai-plus/scripts/`. Outdated boards self-update without `deploy_services.bat`. A toast nags for a board reboot when the new files include something that needs a restart to take effect.

**Fixed**
- Voice capture artifacts (`kbvoice.wav`, `waveform.png`, `mfcc.png`) now write to `/root/` instead of `/` (ws_shell's pty inherits cwd=/ from S99 init, not /root).
- TCP relay chunk parser splits on `#` so coalesced messages like `#process_start#process_stop` aren't dropped.
- `readFile` fails fast on missing files instead of waiting out the 60 s safety timeout.
- `voice_stream.py` uses `SO_REUSEADDR` and exits hard on bind failure (no more silent ephemeral-port fallback).

**Changed**
- File explorer dialog rewrite (cleaner state machine, fewer race conditions).
- mAI Plus voice route in `model-formats/registry.js` is now `Cvimodel` (was `NumpyFp32` — the numpy path was a stopgap before the cvimodel pipeline came online).
- `deploy_services.bat` rewritten as initial-setup-only — the IDE handles ongoing updates.

### 1.0.0

Initial release.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vue 3 (Composition API) + Vite |
| UI | Vuetify 3 (Material Design) |
| State Management | Pinia (with localStorage persistence) |
| Routing | Vue Router 4 (file-based via vite-plugin-pages) |
| Visual Programming | Blockly 10 |
| AI Model Designer | BaklavaJS (node-based graph editor) |
| Terminal | xterm.js |
| Browser Inference | TensorFlow.js (Web Worker) |
| Deployment | Firebase Hosting |
| Device Comms | WebUSB/ADB, WebSocket, WebSocket-Shell |

---

## Project Structure

```
workspace_ide/
├── boards/                        # Hardware board definitions
│   ├── kidbright-mai/             #   MaixII board (NCNN, web-adb protocol)
│   │   ├── index.js              #     Board metadata, protocol, block list
│   │   ├── main.py               #     Python code template (##{main}## placeholder)
│   │   ├── toolbox.js            #     Blockly toolbox categories
│   │   ├── workspace.json        #     Default Blockly workspace
│   │   ├── blocks/               #     Block definitions + Python generators
│   │   │   ├── blocks_basic.js   blocks_camera.js   blocks_display.js
│   │   │   ├── blocks_image.js   blocks_gpio.js     blocks_pin.js
│   │   │   ├── blocks_ai.js     blocks_maix_v4.js
│   │   │   ├── generators_basic.js  generators_camera.js  generators_display.js
│   │   │   ├── generators_image.js  generators_gpio.js    generators_pin.js
│   │   │   └── generators_ai.js
│   │   ├── libs/                 #     Python libraries deployed to board
│   │   ├── examples/             #     Example projects (workspace.json per example)
│   │   └── scripts/              #     MJPEG server, RPyC integration
│   │
│   └── kidbright-mai-plus/        #   MaixCAM CV181x board (cvimodel, websocket-shell)
│       ├── (same structure as above)
│       ├── cert.pem / key.pem    #     TLS certificates for wss:// connection
│       └── maix_stream.py        #     Camera streaming service
│
├── extensions/                    # AI/ML pipeline subsystems
│   ├── ImageClassification/
│   │   ├── config.js             #     Extension metadata + instruction pointers
│   │   ├── model-graph.json      #     Default BaklavaJS graph (MobileNet-100)
│   │   ├── classify.worker.js    #     TF.js Web Worker for browser inference
│   │   ├── Components/           #     Capture.vue, Annotate.vue, Train.vue
│   │   ├── Instructions/         #     Step-by-step Thai instructions per stage
│   │   └── Blocks/               #     Blockly blocks + toolbox for browser inference
│   │
│   ├── ObjectDetection/
│   │   ├── config.js             #     Extension metadata
│   │   ├── model-graph.json      #     Default graph (YOLO)
│   │   ├── detection.worker.js   #     TF.js Web Worker with YOLO post-processing
│   │   ├── Utils/yolo.js         #     YOLO head decode, box correction, NMS
│   │   ├── Components/           #     Capture.vue, Annotate.vue (bounding box), Train.vue
│   │   ├── Instructions/
│   │   └── Blocks/
│   │
│   └── VoiceClassification/
│       ├── config.js             #     Extension metadata + duration option (default 3s)
│       ├── model-graph.json      #     Custom CNN for MFCC spectrograms
│       ├── Components/           #     Capture.vue (audio record), Annotate.vue, Train.vue
│       ├── Instructions/
│       └── Blocks/
│
├── plugins/                       # Hardware sensor/service modules
│   ├── DHT11/                    #     Temperature/humidity sensor
│   ├── I2C/ I2C_uAiP/           #     I2C communication
│   ├── MQTT/                     #     MQTT publish/subscribe
│   ├── NETPIE/                   #     NETPIE IoT platform
│   ├── SHT31/ SHT31_pylibi2c/   #     Temperature/humidity (I2C)
│   └── iKB1/ iKB1_uAiP/         #     iKB1 expansion board
│   # Each plugin contains:
│   #   index.js        - metadata, compatible boards, toolbox XML
│   #   blocks/blocks.js     - Blockly block definitions
│   #   blocks/generators.js - Python code generators
│   #   libs/*.py        - Python libraries for board
│
├── src/                           # Vue application source
│   ├── main.js                   #   Entry point: loads boards/plugins/extensions via import.meta.glob
│   ├── App.vue                   #   Root component -> RouterView
│   │
│   ├── pages/                    #   File-based routing (vite-plugin-pages)
│   │   ├── index.vue             #     Main IDE: Header + Blockly + Footer/Terminal (776 lines)
│   │   ├── ai.vue                #     AI Training: 4-step pipeline UI
│   │   └── [...all].vue          #     404 fallback
│   │
│   ├── components/
│   │   ├── Blockly.vue           #     Blockly workspace wrapper (inject, serialize, toolbox)
│   │   ├── CustomCategory.js     #     Custom toolbox category renderer (SVG icons)
│   │   ├── CustomTrashcan.js     #     Custom trashcan positioning
│   │   ├── BlocklyTheme.js       #     Block color theme definition
│   │   ├── ModelDesigner.vue     #     BaklavaJS graph editor for AI model architecture
│   │   ├── TrainingToolbar.vue   #     Train/Test/Download buttons + Colab URL input
│   │   ├── Header.vue            #     Toolbar: Connect, Upload, FileBrowser, WiFi, AI, Plugins, Project
│   │   ├── Footer.vue            #     Terminal panel (xterm.js) + undo/redo controls
│   │   ├── MessageLog.vue        #     Training log display
│   │   ├── ZoomToFit.js          #     Blockly zoom-to-fit utility
│   │   ├── utils.js              #     updateBlockCategory, getColorIndex, randomId
│   │   ├── InputConnection/      #     16 components: camera/audio capture, MFCC, streaming
│   │   ├── MainPanel/            #     SidePanel.vue (AI training sidebar with step navigation)
│   │   ├── dialog/               #     19 dialog components (project, board, plugin, wifi, etc.)
│   │   ├── charts/               #     AccuracyMatrixChart, LossMatrixChart
│   │   ├── Instructions/         #     Instruction display wrapper
│   │   └── buttons/              #     Reusable button components
│   │
│   ├── blocks/                   #   Core Blockly definitions (always loaded)
│   │   ├── blocks_controls.js    blocks_operators.js    blocks_advanced.js
│   │   ├── blocks_pin.js         blocks_procedures.js   blocks_variables.js
│   │   ├── blocks_text_code.js
│   │   ├── generators_controls.js  generators_operators.js  generators_advanced.js
│   │   ├── generators_pin.js       generators_procedures.js generators_text_code.js
│   │   └── (14 files total)
│   │
│   ├── engine/                   #   Core execution and communication
│   │   ├── board.js              #     Board loading, dynamic script execution, block registration
│   │   ├── storage.js            #     Browser Persistent FileSystem API (800MB quota)
│   │   ├── helper.js             #     Binary protocol: packMessage/unpackMessage, Command enum
│   │   ├── struct.js             #     Binary struct utilities
│   │   ├── SingletonShell.js     #     ADB shell subprocess singleton (stdin/stdout routing)
│   │   ├── WebSocketShell.js     #     Plain WebSocket shell wrapper
│   │   ├── protocols/
│   │   │   ├── web-adb.js        #       WebUSB + @yume-chan/adb: file sync, shell, model upload
│   │   │   ├── websocket.js      #       Framed binary protocol (Command enum): auth, run, output
│   │   │   └── websocket-shell.js #      Raw PTY shell: chunked base64 upload, JSON system cmds
│   │   └── project-strategies/
│   │       ├── BaseProjectStrategy.js
│   │       ├── ImageClassificationStrategy.js   # Dataset: class-folder layout
│   │       ├── ObjectDetectionStrategy.js       # Dataset: Pascal VOC (XML + JPEGImages)
│   │       └── VoiceClassificationStrategy.js   # Dataset: waveform + sound + MFCC folders
│   │
│   ├── services/
│   │   └── ProjectIOService.js   #     Project save/load: ZIP archive with project.json + dataset
│   │
│   ├── store/                    #   Pinia state management
│   │   ├── workspace.js          #     Project state, labels, trainConfig, model, code/block (PERSISTED)
│   │   ├── board.js              #     Connection state, protocol handler routing, upload()
│   │   ├── dataset.js            #     Dataset items, addData, setClass, annotations (PERSISTED)
│   │   ├── plugin.js             #     Installed plugins list (PERSISTED)
│   │   ├── project.js            #     Project metadata
│   │   └── server.js             #     Colab server: trainColab, convertModel, EventSource listener
│   │
│   ├── nodes/                    #   BaklavaJS model graph node definitions
│   │   ├── inputs/               #     default-input.js (epochs, batch_size, learning_rate, train_split)
│   │   ├── layers/               #     conv2d, dense, dropout, flatten, maxpooling2d
│   │   ├── models/               #     image_classification, mobilenet, resnet, yolo, voice_classification
│   │   ├── outputs/              #     classification-output, object-detection-output, default-output
│   │   └── interfaces/           #     Custom Baklava interface types
│   │
│   ├── @core/                    #     Reusable UI components, SCSS mixins, utilities
│   ├── @iconify/                 #     Custom icon build system (build-icons.js)
│   ├── @layouts/                 #     Layout components and styles
│   ├── layouts/                  #     blank.vue, default.vue
│   ├── styles/                   #     Global SCSS, Vuetify variables, Baklava overrides
│   ├── plugins/vuetify/          #     Vuetify config: theme, icons, defaults
│   ├── router/index.js           #     Vue Router setup (auto-generated from pages/)
│   ├── assets/                   #     Images, icons, logos
│   └── png/                      #     Generated block icon graphics (87 files)
│
├── public/                        # Static assets (loader.css, sounds, cursors, SVGs)
├── dist/                          # Production build output (Firebase-deployed)
│
├── index.html                     # HTML entry: <div id="app"> + /src/main.js
├── vite.config.js                 # Build config: Vue, Vuetify, auto-import, path aliases
├── package.json                   # Dependencies + scripts
├── firebase.json                  # Firebase Hosting: dist/, SPA rewrite
├── .firebaserc                    # Firebase project: kidbright-mai
├── Dockerfile                     # node:16.20, npm run dev
└── Knowledge.md / rule.md         # Domain knowledge + AI agent contribution rules
```

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                    Vue 3 SPA (Browser)                      │
│                                                            │
│  ┌────────────┐  ┌────────────┐  ┌───────────────────┐    │
│  │ index.vue  │  │  ai.vue    │  │  [...all].vue     │    │
│  │ (Coding)   │  │ (Training) │  │  (404)            │    │
│  └─────┬──────┘  └─────┬──────┘  └───────────────────┘    │
│        │               │                                    │
│  ┌─────┴───────────────┴────────────────────────────┐      │
│  │              6 Pinia Stores                       │      │
│  │  workspace | board | dataset | plugin |           │      │
│  │  project   | server                              │      │
│  └──────────────────────────────────────────────────┘      │
│                                                            │
│  ┌────────────┐  ┌────────────────┐  ┌──────────────┐     │
│  │  Blockly   │  │  BaklavaJS     │  │   xterm.js   │     │
│  │  (Blocks)  │  │ (Model Graph)  │  │  (Terminal)  │     │
│  └────────────┘  └────────────────┘  └──────────────┘     │
│                                                            │
│  ┌──────────────────────────────────────────────────┐      │
│  │              Engine Layer                         │      │
│  │  board.js | storage.js | helper.js                │      │
│  │  SingletonShell | WebSocketShell                  │      │
│  │  ProjectIOService | ProjectStrategies             │      │
│  └──────────────┬──────────────┬────────────────────┘      │
└─────────────────┼──────────────┼────────────────────────────┘
                  │              │
    ┌─────────────┤              ├─────────────┐
    ▼             ▼              ▼             ▼
┌────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│Web-ADB │  │WebSocket │  │WebSocket │  │  Colab   │
│ (USB)  │  │ (Binary) │  │ (Shell)  │  │ Server   │
└───┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
    ▼            ▼              ▼              ▼
┌────────────────────────┐          ┌──────────────┐
│   KidBright Board      │          │ GPU Training │
│   MaixII / MaixCAM     │          │ (Remote)     │
└────────────────────────┘          └──────────────┘
```

---

## Dynamic Module Loading

All boards, extensions, and plugins are loaded dynamically at startup via `import.meta.glob()` in `src/main.js`. Adding a new module requires only placing a folder with the correct structure -- no code changes needed.

**Loading chain:**
```
main.js
  ├── import.meta.glob('boards/*/index.js')         → $boards
  ├── import.meta.glob('extensions/*/config.js')     → $extensions
  ├── import.meta.glob('plugins/*/index.js')         → $plugins
  ├── import.meta.glob('boards/*/main.py', as:'raw') → board.codeTemplate
  ├── import.meta.glob('extensions/*/Components/*.vue')  → extension.components
  ├── import.meta.glob('extensions/*/Instructions/*.vue') → extension.instructions
  └── import.meta.glob('extensions/*/model-graph.json')   → extension.graph
```

---

## Blockly System

### Code Generation Pipeline

```
User drags blocks
    ↓
Blockly Workspace (Blockly.vue)
    ↓  Blockly.defineBlocksWithJsonArray()
Block Definitions (blocks_*.js)
    ↓  python.pythonGenerator.forBlock['block_type']
Python Generators (generators_*.js)
    ↓  pythonGenerator.workspaceToCode(workspace)
Generated Python Code
    ↓  board.codeTemplate.replace("##{main}##", code)
Wrapped with board main.py template
    ↓
Upload to board via protocol handler
```

### Block Categories

| Category | Color | Examples |
|----------|-------|---------|
| Basic | #5BA58C | display camera, delay, forever loop |
| AI | #5ba58c | classify image, detect object (YOLO), classify voice |
| Display/Image | #9fa55b | resize, rotate, flip, crop, draw shapes |
| Loops | #56A668 | repeat, while, for, forEach, break |
| Logic | #617E95 | if/else, comparisons, boolean ops |
| Math | #3A4F8B | arithmetic, trig, random, rounding |
| GPIO I/O | #a5745b | RGB LED, servo, buzzer, switch, accelerometer |
| Text | #5ba593 | print, join, length, case change |
| List | #745ba5 | create, repeat, index, sort, split |
| Variables | #a55b80 | set/get variable |
| Functions | #995ba5 | define/call procedures |

Blocks are additive: core blocks (src/blocks/) + board blocks + installed plugin blocks.

---

## AI Training Pipeline

### 4-Step Workflow (ai.vue)

```
Step 1: CAPTURE                     Step 2: ANNOTATE
┌─────────────────────────┐        ┌──────────────────────────┐
│ Camera/Mic input        │        │ Classification: assign   │
│ → datasetStore.addData()│───────>│   class labels           │
│ Stored in browser FS    │        │ Detection: draw bounding │
│ (800MB persistent)      │        │   boxes (VueCrop)        │
└─────────────────────────┘        │ Voice: label audio clips │
                                   └────────────┬─────────────┘
                                                │
Step 4: DEPLOY                      Step 3: TRAIN
┌──────────────────────────┐       ┌──────────────────────────┐
│ GET /convert → board fmt │       │ ModelDesigner → trainConfig│
│ GET /download → model    │<──────│ ZIP dataset → POST /upload│
│ importModelFromBlob()    │       │ POST /train → SSE /listen │
│ Upload to board via      │       │ Real-time: epoch, batch,  │
│ protocol handler         │       │ loss, accuracy charts     │
└──────────────────────────┘       └──────────────────────────┘
```

### Supported AI Models

| Type | Model | Board | FPS | Accuracy | Format |
|------|-------|-------|-----|----------|--------|
| Image Classification | MobileNet (100/75/50/25/10%) | mAI / mAI Plus | -- | Variable | NCNN / cvimodel |
| Image Classification | ResNet-18 | mAI / mAI Plus | -- | Higher | NCNN / cvimodel |
| Object Detection | YOLO v2 slim | mAI / mAI Plus | ~30 | Low | NCNN / cvimodel |
| Object Detection | YOLO 11n | mAI Plus | ~60 | Medium (mAP 39.5) | cvimodel |
| Object Detection | YOLO 11s | mAI Plus | ~20 | High (mAP 47.0) | cvimodel |
| Voice Classification | Custom CNN (MFCC) | mAI / mAI Plus | -- | Variable | NCNN / cvimodel |

Model selection is configured in the BaklavaJS graph editor. Each model node (e.g., `src/nodes/models/yolo.js`) outputs `trainConfig.modelType`.

### trainConfig Flow

```
Frontend (BaklavaJS Graph)                      Backend (Colab)
──────────────────────                          ───────────────
Model Node (yolo.js / mobilenet.js / ...)
  → modelType, objectThreshold, iouThreshold
Input Node (default-input.js)
  → epochs, batch_size, learning_rate, train_split
Output Node (object-detection-output.js / classification-output.js)
  → validateMatrix, saveMethod
              ↓
ModelDesigner.computeGraph()
  → DependencyEngine.runOnce()
  → workspaceStore.trainConfig
              ↓
ProjectIOService.saveProject('upload')
  → Strategy pattern:
    ImageClassification → class-folder layout
    ObjectDetection → Pascal VOC (Annotations/ + JPEGImages/ + ImageSets/)
    VoiceClassification → waveform/ + sound/ + mfcc/ folders
  → project.zip { project.json, dataset.json, dataset/, model/ }
              ↓
POST /upload (FormData: zip + project_id)
POST /train  (JSON: project_id + trainConfig)
                                                training_task():
                                                  read project.json
                                                  route by modelType
                                                  → train with config
                                                convert_model():
                                                  ONNX → model_transform
                                                  → calibration → model_deploy
                                                  → .cvimodel + .mud (MaixCAM)
                                                  → .bin + .param (NCNN/mAI)
              ↓
EventSource /listen (SSE: epoch, batch, metrics)
GET /convert?project_id=X
GET /projects/{id}/output/{model_file}
  → workspaceStore.importModelFromBlob()
  → model stored in browser FS with MD5 hash
  → uploaded to board during code deploy (hash-based cache check)
```

### Colab Server API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/ping` | Server status + training stage (0-5) |
| EventSource | `/listen` | Real-time SSE: epoch/batch progress, metrics |
| POST | `/upload` | Upload project ZIP (FormData) |
| POST | `/train` | Start training with trainConfig |
| GET | `/convert?project_id=X` | Convert trained model to board format |
| GET | `/projects/{id}/output/{file}` | Download converted model files |
| GET | `/terminate?project_id=X` | Stop training |

**Training Stages:** 0=None, 1=Prepare, 2=Training, 3=Trained, 4=Converting, 5=Ready

### Conversion Details (MaixCAM / mAI Plus)

- **Method B** (2 output nodes): `/model.23/dfl/conv/Conv_output_0` + `/model.23/Sigmoid_output_0`
- **Input size**: 224x320
- **Quantization**: INT8 via tpu-mlir (CVITEK TPU)
- **Tolerance**: yolo11n = `0.9,0.6` / yolo11s = `0.85,0.5`
- **MUD file**: `model_type = yolo11`

---

## Device Communication

### Protocol Comparison

| Aspect | web-adb (USB) | websocket (Binary) | websocket-shell (PTY) |
|--------|--------------|--------------------|-----------------------|
| Board | kidbright-mai | kidbright-mai-plus | kidbright-mai-plus |
| Transport | WebUSB API | ws:// | wss:// (TLS) |
| Library | @yume-chan/adb | Custom binary protocol | Raw PTY |
| Auth | ADB credential store | packMessage(Auth) | None |
| Code Upload | ADB sync file transfer | Binary Command.Run packet | Chunked base64 JSON |
| Model Upload | ADB sync + hash cache | Not implemented | Chunked 256KB + hash cache |
| Terminal | Shell subprocess stdout | Command.Output packets | Raw PTY output |
| File Ops | Full FS (list, upload, delete) | Run only | Upload + shell commands |

### Upload Code Flow (All Protocols)

```
User clicks "Upload Code" (Header)
    ↓
1. Open serial panel (if closed) + wait
2. terminal.reset()
3. pythonGenerator.workspaceToCode(workspace) → Python code
4. board.codeTemplate.replace("##{main}##", code) → wrapped code
5. boardStore.upload(code, writeStartup)
    ↓
6. Protocol handler:
   a. Send Ctrl+C to stop running code
   b. Upload /root/app/run.py (code)
   c. Upload board python modules
   d. Upload installed plugin libs
   e. Upload AI model if needed (hash-based cache)
   f. Kill previous python3 process
   g. Execute: python3 /root/app/run.py
    ↓
7. Output streams to xterm terminal in real-time
```

### Board Python Template

Each board has a `main.py` template with `##{main}##` placeholder:
- **kidbright-mai**: Initializes camera (224x224), registers signal handlers, runs user code
- **kidbright-mai-plus**: Kills maixapp system processes on start, registers atexit to restart launcher on exit, runs user code

---

## Browser-Based Inference (TensorFlow.js)

Extensions include Web Workers for running AI models directly in the browser (used by Blockly blocks in the browser-based toolbox):

```
classify.worker.js (ImageClassification)
detection.worker.js (ObjectDetection)
    ↓ Web Worker (off main thread)
TF.js loaded from CDN
    ↓
Model loaded from memory buffers (ArrayBuffer)
    ↓ Preprocessing
Image normalized (-1 to 1), resized to input shape
    ↓ Inference
model.predict(tensor)
    ↓ Post-processing
Classification: argMax → class index + probabilities
Detection: YOLO decode → box correction → NMS → filtered bboxes
    ↓
Results returned via postMessage
```

---

## State Management

| Store | File | Persisted | Key State |
|-------|------|-----------|-----------|
| workspace | `store/workspace.js` | Yes | project name/id, code, block, currentBoard, labels, trainConfig, model, projectType, extension, graph |
| board | `store/board.js` | No | connected, handler, protocol, wifi status, upload state |
| dataset | `store/dataset.js` | Yes | data[] (images/audio with annotations), project reference |
| plugin | `store/plugin.js` | Yes | installed plugins list |
| project | `store/project.js` | No | project metadata |
| server | `store/server.js` | No | Colab URL, training state, epoch/batch progress, metrics, EventSource |

---

## UI Layout

### Main IDE (index.vue)

```
┌──────────────────────────────────────────────┐
│ Header: [Connect][Upload][Files][WiFi][AI]   │
│         [Plugins] | [New][Open][Save]        │
├──────────────────────────────────────────────┤
│                                              │
│              Blockly Workspace               │
│         (drag-and-drop block editor)         │
│                                              │
├───────────────────────── ↕ resizable ────────┤
│ Footer: xterm.js Terminal (serial monitor)   │
│         [Undo] [Redo]                        │
└──────────────────────────────────────────────┘
```

### AI Training (ai.vue)

```
┌────────────┬─────────────────────────────────┐
│ SidePanel  │                                 │
│            │  Step 1-2: Capture / Annotate   │
│ Step 1:    │    (Extension components)       │
│  Capture   │                                 │
│ Step 2:    │  Step 3: Train                  │
│  Annotate  │    ModelDesigner (BaklavaJS)    │
│ Step 3:    │    TrainingToolbar              │
│  Train     │    MessageLog / Charts          │
│ Step 4:    │                                 │
│  Ready     │  Step 4: Model Ready            │
│            │    Deploy to board button       │
└────────────┴─────────────────────────────────┘
```

---

## Setup & Development

### Prerequisites
- Node.js 16.20+
- Yarn 1.22+ or npm

### Development
```sh
npm install
npm run dev        # Builds icons + starts Vite dev server (--host)
```

### Production Build
```sh
npm run build      # Builds icons + Vite build + copies boards/plugins/extensions to dist/
npm run preview    # Preview build on port 5050
```

### Firebase Deploy
```sh
firebase deploy    # Deploys dist/ to Firebase Hosting (project: kidbright-mai)
```

### Docker
```sh
docker build -t kidbright-mai-ide .
docker run -p 5173:5173 kidbright-mai-ide
```

---

## Recent Changes (2026-04-16~17)

### Web-ADB Connection Fix
- `board.js`: `markRaw()` on all protocol handlers to prevent Vue Proxy wrapping ES2022 private fields in `@yume-chan/adb`
- `SingletonShell.js`: use `this.adb` instead of parameter `adb` for subprocess.shell()
- `board.js`: `isBoardConnected` getter reads reactive `this.connected` instead of non-reactive handler

### Voice Classification
- **Capture UI refactored**: separated recorder (AdbSoundCapture) from playback (WaveFormPlayer), display switching in Capture.vue
- **VoiceCNN model**: IPU-safe 2D CNN (Conv2d + ReLU + MaxPool2d + Flatten + Linear only, no BatchNorm/AdaptiveAvgPool/Dropout)
- **Pre-built model node**: BaklavaJS "Voice CNN (Recommended)" dropdown instead of manual layer wiring
- **MFCC input shape**: fixed from (3,147,13) to (3,13,147) matching actual ImageFolder output
- **MFCC resize**: `transforms.Resize((13,147))` in training + `mfcc_image.resize(147,13)` on board for variable duration support
- **Duration persist**: added `extension` to Pinia persist paths + fixed ComputedRef unwrap in NewModelDialog
- **Per-item duration**: WaveFormPlayer uses each recording's stored duration, not global config
- **Board connection UX**: auto-connect on AI page mount, Connect Board button + status in side panel

### Object Detection
- **YOLO v2 input size**: changed from 416×416 to 224×224 for V831 AWNN compatibility (matching Sipeed official maix_train)
- **convert_model**: added `voice-cnn` to all 3 switch blocks (best_file, model loading, conversion path)

### UI/UX
- Disabled text selection globally (app-like UI)
- Fixed `null.png` error from WaveFormPlayer when no item selected
- Fixed SoundDatasetList delete not clearing v-model selection

## Contributing

If you are an AI assistant helping to maintain this project, please read `rule.md` in the project root before generating any code.
