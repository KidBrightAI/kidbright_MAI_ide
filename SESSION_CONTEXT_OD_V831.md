# Session Context — Object Detection บน V831 (2026-04-18)

เอกสารส่งต่อสำหรับ session ถัดไปที่จะ focus object detection บน **kidbright-mai (V831)**

---

## เป้าหมาย

ทำ object detection pipeline end-to-end บน V831:
1. สร้างโปรเจคใน IDE → board = kidbright-mai, extension = OBJECT_DETECTION
2. Annotate dataset (bbox)
3. Train บน server → `slim_yolo_v2` (V831 รองรับแค่ตัวนี้)
4. Convert เป็น NCNN AWNN (`.bin` + `.param`)
5. IDE upload model ไป `/root/model/<hash>.{bin,param}` บนบอร์ด
6. Student เขียน blocks ใน IDE → `_yolo = Detector(...)` + `_boxes = _yolo.detect(img, conf, iou)`
7. บอร์ดรัน `detector_runtime.Detector` (AWNN int8 + `decoder.Yolo2`) แสดงผลบน LCD

---

## Repos + ตำแหน่ง

| Repo | Path | Remote | Role |
|---|---|---|---|
| IDE | `/mnt/f/KidBright_MAI/workspace_kidbright_mai_vue3/` | `KidBrightAI/kidbright_MAI_ide` | Vue 3 + Blockly; deploy Firebase |
| Server | `/home/comdet/kidbright_MAI_server/` | `KidBrightAI/kidbright_MAI_server` | Flask + PyTorch training + convert |
| Test projects | `/mnt/f/KidBright_MAI/project/*.zip` | — | known-good zips (`dog_cat_classify_trained.zip` เป็นตัวอย่าง image classify ที่ใช้งานได้), `object_detection_face/` มีอยู่ในโฟลเดอร์ไม่ใช่ zip |

---

## Environment (WSL)

- Ubuntu บน WSL2 + Windows 11
- RTX 3090 + CUDA 11.x, `conda` env `kbmai` (server)
- OpenCV path → **ใช้ env var** `KBMAI_OPENCV_ROOT` (user: "B เพราะ ubuntu ตัวนี้ต้องใช้กับงานอื่นด้วย") — server ไม่ hardcode path
- IDE build: `npx vite build` (cross-env ใน `npm run build` ไม่ทำงานใน WSL shell) — user รัน `npm run dev` เอง ไม่ต้องสั่งให้ build
- Board detection ใน WSL: ต้อง `usbipd attach` (WebUSB จาก browser บน Windows host เห็นตรง ๆ ไม่ต้องผ่าน WSL)

### V831 WebUSB ปัญหาที่เจอ
- `SecurityError: Failed to execute 'open' on 'USBDevice': Access denied` = Windows ADB daemon จับ device อยู่
- Fix: `adb kill-server` ใน Windows PowerShell → refresh browser → คลิก Connect ใหม่

---

## V831 Board Specs

```
Chip:     Allwinner V831 / MaixII
NPU:      AWNN int8 (~0.2 TOPS)
Protocol: web-adb (WebUSB + @yume-chan/adb)
USB VID:  0x18d1 / PID: 0x0002 (Google ADB interface)
OS paths: /root/app/    — user code (run.py, startup.py, board libs, plugins)
          /root/model/  — model files (.bin/.param/.npz)
          /root/scripts/ — boot scripts (uploaded once on first connect)
```

### ที่รองรับ (จาก `boards/kidbright-mai/index.js` `modelOptions`)
- **Image classify**: mobilenet 100/75/50/25/10 + resnet18 (default = `mobilenet-75`)
- **Object detect**: **`slim_yolo_v2` เท่านั้น** (YOLO11 ต้องการ CV181x MLIR)
- **Voice**: `voice-cnn` (CPU numpy fp32; int8 collapsed ทุก config ที่ลอง)

### Evidence ของข้อจำกัด YOLO
- `kidbright_MAI_server/main.py:386` — YOLO11 convert branch guarded ด้วย `board_id == "kidbright-mai-plus"`
- `boards/kidbright-mai/libs/detector_runtime.py` — ใช้ `nn.decoder.Yolo2` (hardcoded architecture)

---

## Architecture ที่ refactor ไว้ใน session นี้ (commit `fa113f0`)

### IDE side

```
src/engine/
├── model-formats/         # ModelFormat abstraction
│   ├── base.js            # pack/unpack/save/upload
│   ├── ncnn-int8.js       # V831 bin+param
│   ├── cvimodel.js        # MaixCAM mud+cvimodel
│   ├── numpy-fp32.js      # V831 voice npz
│   └── registry.js        # pickFor({projectType, boardId, modelType})
├── protocols/             # BoardProtocol abstract + subclasses
│   ├── base.js            # contract: connect/writeFile/statFile/execShell/
│   │                      #           interrupt/writeInput/attachOutput/...
│   │                      #           + shared upload() template method
│   ├── web-adb.js         # V831 extends BoardProtocol
│   └── websocket-shell.js # MaixCAM extends BoardProtocol
├── board-paths.js         # BOARD_APP_DIR = /root/app, BOARD_MODEL_DIR = /root/model
├── board-node-options.js  # board context for BaklavaJS node factories
├── graph-merge.js         # applyBoardDefaults + reconcileWithBoard
└── SingletonShell.js      # subscriber Set model (onOutput → unsub)

boards/kidbright-mai/
├── index.js               # modelDefaults + modelOptions per extension
├── blocks/                # Blockly toolbox + generators (per-board)
│   └── generators_ai.js   # maix3_nn_yolo_load → emits: _yolo = Detector(hash, labels)
└── libs/                  # python uploaded to /root/app/
    ├── detector_runtime.py    # Detector wrapping awnn nn.load + decoder.Yolo2
    ├── classifier_runtime.py  # Classifier wrapping awnn nn.load
    ├── voice_cpu_infer.py     # numpy fp32 voice inference (replaces int8)
    └── voice_mfcc.py          # MFCC extractor

src/pages/index.vue        # slim, composable-driven
src/composables/
├── useDialogs.js          # dialog state ref
├── useBottomPane.js       # terminal + panel sizing + attach/unsub to shell output
└── useProjectActions.js   # create/open/save/delete/example/ai flows
```

### Server side (`/home/comdet/kidbright_MAI_server/main.py`)

```
training_task()
├── modelType === 'slim_yolo_v2' → train_object_detection.py (custom YOLOv2-style)
├── modelType === 'yolo11n/s'    → ultralytics (kidbright-mai-plus only)
├── modelType starts 'mobilenet'/'resnet18' → torchvision v2 (classify)
└── modelType === 'voice-cnn'    → models/voice_cnn.py + log-mel regen

convert_model()
├── V831 + slim_yolo_v2       → NCNN AWNN (int8 calibration + quantize) → output/*.bin + *.param
├── V831 + mobilenet/resnet   → same NCNN AWNN path
├── V831 + voice-cnn          → model_cpu.npz (fp32, skip NCNN)
├── MaixCAM + mobilenet/resnet (main.py:349) → MLIR → cvimodel
└── MaixCAM + yolo11n/s       (main.py:386) → ultralytics export → MLIR → cvimodel
```

---

## Object Detection Pipeline (V831) — Deep Dive

### 1. ใน IDE
- User สร้าง project: board=`kidbright-mai`, extension=`OBJECT_DETECTION`
- `boards/kidbright-mai/index.js` `modelDefaults.OBJECT_DETECTION` → default `modelType='slim_yolo_v2'`
- `modelOptions.OBJECT_DETECTION.YOLO.modelType = ['slim_yolo_v2']` → dropdown มีตัวเดียว
- ModelDesigner (`src/components/ModelDesigner.vue`) โหลด `extensions/ObjectDetection/model-graph.json`
  - `InputNode` (epochs default 100)
  - `YOLO` node (objectThreshold, iouThreshold)
  - `ObjectDetectionOutputNode` (validateMatrix=mAP, saveMethod=best)
- User annotate dataset (bbox) ใน Annotate tab → save to project
- Train tab → `workspaceStore.trainConfig` ประกอบด้วย `{modelType, epochs, ...}` + ส่ง zip ไป server

### 2. ใน Server (กด Train)
- `/train` endpoint รับ zip, แตกลง `data/<project_name>/`
- `training_task()` branch ตาม modelType
- สำหรับ `slim_yolo_v2`:
  - ใช้ `models/slim_yolo_v2.py` + `tools.py` (loss, gt_creator, anchor)
  - Anchors default ใน `data/config.py` `ANCHOR_SIZE`
  - Save best checkpoint ที่ `output/best_map.pth`
- **Known issue (fixed)**: BCE loss สำหรับ objectness — commit `e7f7fb3` (ใน server repo) เปลี่ยนจาก MSE → BCE, `obj_weight=5.0, noobj_weight=1.0`
  - ทำไม: MSE บน sigmoid ทำให้ gradient vanish เมื่อ confidence ต่ำ → objectness อยู่ ~0.05 แม้ mAP=1.0
  - ถ้ายัง low confidence ต้อง diag ตาม script ใน `SESSION_CONTEXT.md` (ของเดิมในไฟล์นี้)

### 3. Convert (กด Convert หลัง Train)
- `convert_model()` สำหรับ V831 + slim_yolo_v2:
  - ONNX export (opset 11)
  - `onnx2ncnn` → `model.bin/param`
  - `ncnnoptimize` → FP16 ต้นฉบับ (optional)
  - Calibrate table (ใช้ project images)
  - `ncnn2int8` → quantized
- Output: `classifier_awnn.bin` + `classifier_awnn.param` (ชื่อ "classifier" เก่าไป แต่ใช้ทั้ง classify + detect)
- **Normalize constants** (Issue #2 ใน SESSION_CONTEXT.md):
  - slim_yolo_v2 ยังใช้ legacy `127.5 / 128` (mean/std 127.5 normalized to 1/128)
  - classify/voice ใช้ ImageNet stats (`mean=[123.675,...], norm=[1/(0.229*255), ...]`)
  - **รอ decision ว่า YOLO slim V831 ควรใช้ ImageNet ด้วยไหม**

### 4. IDE downloads + upload to board
- User กด "Download to board" ใน IDE
- `boardStore.upload(code)` → `WebAdbHandler.upload()` (template method จาก base)
- Bulk tx (`beginBulkWrite` เปิด `adb.sync()` ครั้งเดียว)
- `uploadModelIfNeeded(fs)` → `ModelFormat.uploadToBoard` — size-skip ต่อ file → `sync.write` ไป `/root/model/<hash>.{bin,param}`
- Upload run.py + board python modules + plugin files → `/root/app/`
- `_afterUpload` → `sync` + `killall python3` + `python3 /root/app/run.py`

### 5. Board runtime
- `run.py` import `detector_runtime` + `classifier_runtime`
- Student's generated Python:
  ```python
  from detector_runtime import Detector
  _yolo_labels = ["dog", "cat"]
  _yolo = Detector("<hash>", _yolo_labels)
  _boxes = _yolo.detect(img, conf=0.5, iou=0.5)
  ```
- `Detector.__init__` (`boards/kidbright-mai/libs/detector_runtime.py`):
  - `nn.load({bin, param}, opt={model_type:"awnn", inputs:{input0:(224,224,3)}, outputs:{output0:(7,7,5*(1+4+len(labels)))}, mean:[127.5]*3, norm:[0.0078125]*3})`
  - `decoder.Yolo2(num_classes, anchors, net_in_size=(224,224), net_out_size=(7,7))`
- `detect(img, conf, iou)`:
  - `raw = self._model.forward(img.tobytes(), quantize=True, layout="hwc")`
  - `boxes, probs = self._decoder.run(raw, nms=iou, threshold=conf, img_size=(224,224))`
  - คืน `list[Detection]` ที่มี `.x .y .w .h .class_id .score .label`

---

## Known-good References

### Image classify (เป็นตัวเปรียบเทียบ)
- `/mnt/f/KidBright_MAI/project/dog_cat_classify_trained.zip`
  - board: `kidbright-mai`
  - projectType: `IMAGE_CLASSIFICATION`
  - modelType: `mobilenet-100` (เก่าก่อน refactor default = mobilenet-75)
  - มี `model/model.bin` + `model.param` ที่ convert แล้ว ใช้งานได้
  - **ใช้ validate ว่า pipeline train+convert+deploy ทำงาน**

### Object detection ที่มีอยู่
- `/mnt/f/KidBright_MAI/project/object_detection_face/` (folder, ไม่ใช่ zip)
  - board: `kidbright-mai`
  - modelType: `slim_yolo_v2` (แสดงเป็น "YOLO2-tiny" ใน project.json)
  - **ควรทดลองเปิด project นี้ใน IDE เพื่อ validate flow**

---

## สิ่งที่ต้องตรวจ / ปัญหาที่ยังค้าง

### จาก SESSION_CONTEXT.md เดิม (Issue #3 BCE loss)
- ต้อง verify หลัง retrain: `sigmoid(obj)@POS` ต้องเพิ่มจาก 0.054 → 0.3-0.6
- Script diagnostic อยู่ใน `SESSION_CONTEXT.md` line 85-141

### ที่อาจเจอใหม่
1. **Normalize mismatch**: train ใช้ ImageNet stats vs detector_runtime ใช้ `127.5 / 0.0078125` — ต้อง pick one
2. **Anchors**: `DEFAULT_ANCHORS = [1.19, 1.98, ...]` ใน detector_runtime — ตรงกับ server training config หรือไม่
3. **Input size**: hardcoded `(224, 224)` ใน detector_runtime — ต้องตรงกับ training resolution
4. **Output filename convention**: `classifier_awnn.bin` — ชื่อ confusing สำหรับ detect, อาจเปลี่ยนเป็น `detector_awnn.bin` ในอนาคต แต่ ModelFormat abstraction ยังดู `role: primary` + `ext: bin`
5. **Label ordering**: `labels.txt` vs server `label_list.json` ต้องสม่ำเสมอ
6. **Confidence threshold UI**: `extensions/ObjectDetection/model-graph.json` node YOLO มี `objectThreshold=0.5, iouThreshold=0.5` — ถ้า BCE fix ทำงาน default นี้ควรใช้งานได้

---

## Refactor Infrastructure ที่อาจเจอ (อย่าทำซ้ำ)

ตอน session ใหม่อย่าไปแก้เหล่านี้ (เพิ่งทำใน session นี้ commit `fa113f0`):
- ❌ อย่า add if-else ตาม `board.protocol === 'web-adb'` — ใช้ `boardStore.handler.X()` หรือ `boardStore.capabilities.X`
- ❌ อย่า hardcode `/root/app/` / `/root/model/` ใน JS — ใช้ `import { appPath, modelPath, BOARD_APP_DIR, BOARD_MODEL_DIR } from '@/engine/board-paths'`
- ❌ อย่า call `SingletonShell.setCallback(cb)` / `addCallback(cb)` — ใช้ `SingletonShell.getInstance().onOutput(cb)` รับ unsub fn
- ❌ อย่า hardcode `mobilenet-X` หรือ model choice ใน node files — อ่าน `board.modelDefaults[ext]` / `modelOptions[ext]`
- ❌ อย่า add stub feature ให้ MaixCAM ที่ไม่ได้ test จริง — เปิด `capabilities.fileExplorer=true` ก็ต่อเมื่อ `ws_shell.py` บนบอร์ดมี handler จริง

---

## User Preferences (จำไว้)

- **ภาษาไทยในการสนทนา**, paths/code ภาษาอังกฤษ
- **อย่า assume / หลอน / เดา** ค่า default หรือ constraint — verify จาก repo / evidence ก่อน (memory file: `/home/comdet/.claude/projects/-home-comdet/memory/feedback_no_assume.md`)
- **สั้น กระชับ ไม่ต้องศัพท์เยอะ** — user บอก "อธิบายมีแต่ศัพท์เยอะไปหมด ปวดหัว"
- **Commit ก่อน refactor ใหญ่** เพื่อ rollback — user ขอเอง
- Exploratory questions ตอบ 2-3 ประโยคพร้อม recommendation + tradeoff — ให้ user เลือกก่อนลงมือ
- **Evidence > heuristic** — user frustrated เคยที่ assistant เดา mobilenet-25 default

---

## 2026-04-18 — ReLU6 คือ INT8 Breakthrough (และ Experiments ที่ ruled out)

End-to-end pipeline ทำงานได้แล้ว (train → diag → convert → adb push → on-board detect). ปัญหาหลักที่เหลือคือ **INT8 confidence gap**: fp32 `sigmoid(obj)@POS` ขึ้นไปที่ 0.65 หลัง BCE fix แต่พอ quantize เหลือ ~0.40 บนบอร์ด ต้องลด default threshold จาก 0.5 → 0.3 ถึงจะ detect ได้.

### 7-way experiment บน 10 test images + on-device forward profiling (dog/phone, 40 ภาพ training set)

| Model | Training | forward ms | fps | hit@0.5 | dog mean | phone mean | สถานะ |
|---|---|---|---|---|---|---|---|
| v1 baseline | 100ep, LeakyReLU | 60 | 16.6 | 5/10 | 0.391 | 0.560 | — |
| v2 (A+C) | 200ep, LeakyReLU + aug calib | 60 | 16.6 | 2/10 | 0.504 | 0.308 | 🔴 overfit |
| v3 (A only) | 100ep, LeakyReLU + aug calib | 60 | 16.6 | 4/10 | 0.337 | 0.551 | 🟡 marginal |
| v4 (C only) | 200ep, LeakyReLU | 60 | 16.6 | 2/10 | 0.476 | 0.266 | 🔴 overfit |
| QAT | 100ep, LeakyReLU + fake-quant | 60 | 16.6 | 3/10 | 0.292 | 0.509 | 🔴 worse |
| ReLU6 | 100ep, ReLU6 | **523** | **1.9** | 9/10 | 0.487 | 0.701 | 🔴 **CPU fallback!** |
| **ReLU** ✨ | **100ep, plain ReLU** | **61** | **16.5** | **8/10** | **0.536** | **0.668** | ✅ **sweet spot** |

### สาเหตุที่ต้องเทียบให้ละเอียด — ReLU6 trap

ReLU6 ชนะ confidence แต่ทำ forward ช้า 9× → **ไม่ใช่เรื่อง INT8 quantization อย่างเดียว** ที่สำคัญคือ **NPU op set**:
- AWNN (V831) รัน ReLU, LeakyReLU บน NPU → ~60ms forward
- AWNN ไม่รองรับ ReLU6 → fallback CPU → ~520ms forward
- Evidence: Sipeed reference `yolo2_20class_awnn.bin` (LeakyReLU) ได้ 60ms; ReLU6 model architecture + size เหมือนกันเป๊ะ แต่ 9× ช้า

### ทำไม plain ReLU ชนะ
- Activation ∈ [0, ∞) — negative tail ถูก clip ไปที่ 0 (vs LeakyReLU 0.1x)
- Upstream BatchNorm ทำให้ activation distribution stable → INT8 dynamic range ยังใช้งานได้ดีแม้ไม่ bounded upper
- NPU-accelerated → 61ms forward ≈ LeakyReLU
- int8 confidence: 8/10 hit@0.5 (ใกล้ ReLU6 9/10, ดีกว่า LeakyReLU 5/10 เยอะ)
- **Live camera loop: 1.7 fps → 11.5 fps** (6.8×)

### ที่ ruled out พร้อมเหตุผล (สำหรับ session ถัดไปจะได้ไม่เสียเวลา)
- **Normalize mismatch** — verified ตรงกันทุก stage (train BaseTransform / val / calibration spnntools / runtime detector_runtime ใช้ `(x-127.5)/128` เหมือนกันหมด) **ไม่ใช่ปัญหา**
- **BGR/RGB mismatch** — verified `data/custom.py:131-132` swap BGR→RGB หลัง augmentation, board `maix.image` ก็ส่ง RGB → channel order ตรงกัน **ไม่ใช่ปัญหา**
- **200 epochs** — overfit บน 40 ภาพ, phone confidence ตก 53% เพราะ model memorize dog features
- **Augmented calibration (10×)** — เพิ่ม 40→400 ภาพ ไม่ช่วย INT8 range coverage อย่างมีนัยสำคัญ
- **QAT symmetric per-tensor** — spnntools scheme ไม่เปิดเผย exact, simulation ไม่ match → weights compensate ผิดทิศ → worse than plain
- **YOLOv5/8/11** — V831 AWNN ไม่รองรับ SiLU/SPPF/complex reshape/transpose (confirmed จาก Sipeed wiki, MaixPy3 archived Jan 2024) — MaixCAM only

### ยังไม่ได้ลอง (ถ้า ReLU6 ยังไม่พอ)
1. **MobileNetV1 (α=0.5) backbone แทน DarkNet_Tiny** — maix_train canonical path, built-in ReLU6
2. **FOMO** (Edge Impulse) — centroid-only output, ไม่มี bbox — ใช้เมื่อไม่ต้องการ size/position precise
3. **เก็บ dataset เพิ่ม 100+ ภาพต่อ class** — root cause จริงคือ data scarcity

### Key V831 quantization lessons (จาก research + measurements)
- **AWNN NPU op set** (verified บนบอร์ด): ReLU, LeakyReLU ทำงาน NPU ~60ms. **ReLU6 fallback CPU 520ms** — ใช้ ReLU แทน
- **AWNN ไม่รองรับ**: Upsample, Interpolate, Resize (kills FPN/PAN), Transpose, permute, SiLU, Swish, Mish, Hardswish, PReLU (unreliable)
- **Bounded activations** ดีสำหรับ INT8 ทฤษฎี แต่ต้องเช็คว่าอยู่ใน NPU op set ก่อน — ReLU6 trap เคยเจอมาแล้ว
- **BN fold** เกิดใน `spnntools optimize` (หลัง train) ไม่ต้อง fold เองใน training
- **Input size** non-standard (416) break AWNN online converter → stick to 224x224
- **Forward time reference** (slim_yolo_v2, 224x224, V831 NPU): ~60ms = 16 fps theoretical ceiling

---

## Commits / Rollback Points

### IDE (`workspace_kidbright_mai_vue3`)
| Commit | Description |
|---|---|
| `55fd410` | **HEAD** — docs: session context for object detection on V831 |
| `fa113f0` | BoardProtocol abstract + SingletonShell subscriber model + UI gating + disconnect flow |
| `906021d` | Board-owned modelDefaults + path constants + dead-code purge (-3470 LOC) |
| `78a087f` | Move inference code into board runtime libraries |
| `b0dca1c` | Centralize model file handling behind ModelFormat abstraction |
| `fc8753e` | Voice classification on V831 via CPU numpy path |

### Server (`kidbright_MAI_server`)
| Commit | Description |
|---|---|
| `9efe26f` | **HEAD — ReLU activation** (NPU-accel, 11.5 fps, hit@0.5 8/10) |
| `c30b861` | QAT scaffold + calib-dir override (experimental env-gated) |
| `85641c6` | ReLU6 (superseded by 9efe26f — confidence ok แต่ CPU fallback 9× slow) |
| `992dfbe` | wire voice CPU path into Colab /train + /convert |
| `e7f7fb3` | YOLO BCE objectness loss fix |
| `3bf9a32` | ImageNet mean/norm for V831 calibration classify/voice |

---

## Quick Start Check List (สำหรับ session ถัดไป)

1. ✅ อ่านไฟล์นี้ + `SESSION_CONTEXT.md` (เก่า มี YOLO BCE diag script)
2. ✅ Verify รัน `npm run dev` ได้ (IDE), server รัน Flask ได้
3. ✅ End-to-end pipeline ทำงาน (commit `85641c6` ReLU6 + `e7f7fb3` BCE)
4. ✅ Default threshold 0.5 ใช้งานได้ (hit 9/10 บน test set)
5. ▢ ถ้า user รายงาน miss บางภาพ → analyze image feature (อาจต้องเก็บ data เพิ่ม)
6. ▢ ถ้าต้องการ push accuracy สูงขึ้นอีก → ลอง MobileNetV1 backbone swap (item #1 ในลิสต์ "ยังไม่ได้ลอง" ข้างบน)

### Source of truth (ตรวจก่อนลงมือทุก session)
- **Backend**: `/home/comdet/kidbright_MAI_server/` (up-to-date = origin/main, clean)
- **Frontend**: origin/main — `/mnt/f/workspace_kidbright_mai_vue3/` (Windows dev, CRLF via `core.autocrlf=true`)
- ❌ `/mnt/f/kidbright_MAI_server/` ถูกลบทิ้งแล้ว (session 2026-04-18 เก่า 59 commits)
- `/home/comdet/kidbright_MAI_ide/` = mirror ของ /mnt/f เพื่อรันบน WSL สะดวก, pull ให้ทันก่อนใช้
