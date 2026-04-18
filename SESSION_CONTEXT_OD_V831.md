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

## Commits / Rollback Points

### IDE (`workspace_kidbright_mai_vue3`)
| Commit | Description |
|---|---|
| `fa113f0` | **HEAD** — BoardProtocol abstract + SingletonShell subscriber model + UI gating + disconnect flow |
| `906021d` | Board-owned modelDefaults + path constants + dead-code purge (-3470 LOC) |
| `78a087f` | Move inference code into board runtime libraries |
| `b0dca1c` | Centralize model file handling behind ModelFormat abstraction |
| `fc8753e` | Voice classification on V831 via CPU numpy path |

### Server (`kidbright_MAI_server`)
| Commit | Description |
|---|---|
| `992dfbe` | **HEAD** — wire voice CPU path into Colab /train + /convert |
| `e7f7fb3` | YOLO BCE objectness loss fix |
| `3bf9a32` | ImageNet mean/norm for V831 calibration classify/voice |

---

## Quick Start Check List (สำหรับ session ถัดไป)

1. ✅ อ่านไฟล์นี้ + `SESSION_CONTEXT.md` (เก่า มี YOLO BCE diag script)
2. ✅ Verify รัน `npm run dev` ได้ (IDE), server รัน Flask ได้
3. ▢ เปิด project `object_detection_face/` ใน IDE → ดูว่า dropdown default = `slim_yolo_v2`
4. ▢ Annotate + Train → เช็ค server log ว่า training path ใช้ BCE loss หรือไม่
5. ▢ รัน diagnostic script ใน Colab/local: `sigmoid(obj)@POS` ควรสูงขึ้น
6. ▢ Convert → check `classifier_awnn.bin/param` output
7. ▢ Deploy ไป V831 + รัน detect — วัด default threshold 0.5 ทำงานหรือไม่
8. ▢ ถ้า confidence ยังต่ำ → เพิ่ม `obj_weight` ใน BCE branch หรือ normalize per-count
