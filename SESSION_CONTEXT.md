# Debug Session Context — 2026-04-17

ไฟล์สรุปบริบทของ debug session สำหรับส่งต่อไปยัง Claude Code ในเครื่อง/session อื่น อ่านไฟล์นี้ก่อนเริ่ม continue งาน

## Project Layout

สอง repos เป็น sibling directories ที่เกี่ยวข้องกัน:
- `workspace_ide/` — Vue 3 + Blockly IDE (repo: `KidBrightAI/kidbright_MAI_ide`) deploy บน Firebase
- `workspace_server/` — Flask + PyTorch + Ultralytics training server (repo: `KidBrightAI/kidbright_MAI_server`) รันบน Google Colab ผ่าน pagekite tunnel

การเปลี่ยนแปลงเรื่อง normalization / loss / preprocessing มักต้องแก้ทั้งสอง repos เพราะ server เทรน + convert, ide บอกบอร์ดว่า preprocess inference ยังไง

## Issue #1: npm run build ไม่คัดลอก nested files ลง dist/

**อาการ**: หลัง `firebase deploy` เปิดเว็บเจอ `Uncaught SyntaxError: Unexpected token '<'` ตอน fetch `/boards/kidbright-mai//blocks/blocks_basic.js`

**Root cause**: `package.json` script `copy` เขียน glob `boards/**/*` แบบไม่ใส่ quote → npm ใช้ `/bin/sh` (POSIX, ไม่มี globstar) expand เป็น `boards/*/*` ก่อนถึง copyfiles → คัดลอกแค่ไฟล์ชั้น 2 ไม่เข้า `blocks/`, `libs/`, `scripts/`, `images/`

**Fix** (commit `5567950` @ workspace_ide):
- ใส่ `"..."` ล้อม glob
- เปลี่ยน `set NODE_OPTIONS=...` (Windows-only) → `cross-env NODE_OPTIONS=...`

## Issue #2: V831 (kidbright-mai) inference ใช้ mean/norm ไม่ตรง training

**อาการ**: Voice classification โมเดล overfit ตลอด — val_acc บน Colab สูง แต่ accuracy บนบอร์ดตก

**Root cause**: Training ทั้ง classify + voice ใช้ ImageNet stats `Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])` แต่:
- `workspace_server/main.py:419` (spnntools calibrate) ใช้ `--m=127.5 --n=0.0078125`
- `workspace_ide/boards/kidbright-mai/blocks/generators_ai.js` (`nn.load` options) ใช้ `mean=[127.5,...], norm=[1/127.5,...]`

คำนวณจริงที่ AWNN ทำ: `x' = (x - mean) * norm` โดย `norm = 1/std` (multiplier ไม่ใช่ divisor) ตามสูตร NCNN `substract_mean_normalize`

**ค่าที่ถูกต้อง** (verified จาก `workspace_server/main.py:294` ที่ mai-plus tpu-mlir path ตั้งไว้ถูกอยู่แล้ว):
- `mean = [123.675, 116.28, 103.53]` = `[0.485, 0.456, 0.406] × 255`
- `norm = [0.01712475, 0.01750700, 0.01742919]` = `1/([0.229, 0.224, 0.225] × 255)`

**Fix**:
- `workspace_server` commit `3bf9a32` — `main.py:419` แยก branch ตาม modelType: `slim_yolo_v2` คงค่าเดิม ที่เหลือ (classify/voice) ใช้ ImageNet stats
- `workspace_ide` commit `d59b06e` — แก้ 2 block ใน `generators_ai.js`:
  - `maix3_nn_classify_load` (line 19-20)
  - `maix3_nn_voice_load` (line 97-98)
  - **ไม่แตะ** `maix3_nn_yolo_load` (รอ deep dive YOLO แยก)

**ผลข้างเคียง**: โมเดลเก่าที่ train + convert ก่อน fix นี้ ใช้ต่อไม่ได้ ต้อง retrain + reconvert ใหม่ทั้งหมด เพราะ calibration table ก็เปลี่ยน

## Issue #3: YOLO slim (V831) objectness confidence ไม่ขึ้น แม้ mAP สูง

**อาการ**: User เทรน slim_yolo_v2 บน 28 ภาพ 100 epochs ได้ `mAP = 1.000` บน validation set แต่พอ deploy บนบอร์ด ต้องตั้ง `nms=0.1, threshold=0.1` ถึง detect ได้

**Diagnostic (รันบน Colab verify ผลจริง)**:
```
positive cells: 4 / 980
obj_sigmoid @ POSITIVE: mean=0.054, max=0.095
obj_sigmoid @ negative: mean=0.023, max=0.127
IoU(pred, gt) @ POSITIVE: mean=0.635 (conf target)
```

โมเดล rank ถูก (pos 0.054 สูงกว่า neg 0.023 ทำให้ mAP=1.0) แต่ absolute confidence ต่ำกว่า threshold 0.5 ทุกตัว

**Root cause**: `tools.loss()` default `obj_loss_f='mse'` ใช้สูตร `(sigmoid(obj_logit) - iou)^2`. MSE gradient บน sigmoid = `sigmoid·(1-sigmoid)·(pred-target)` — เมื่อ sigmoid ไกลจาก 1 (เช่น 0.05) gradient จะ vanish ทำให้ logit ไม่ถูก push ขึ้น

BCE gradient = `sigmoid - target` ตรงๆ ไม่มี sigmoid derivative ลด signal

**Fix** (workspace_server commit `e7f7fb3`):
- `tools.py:401` เปลี่ยน default `obj_loss_f='bce'`
- BCE branch: ปรับ weight `obj=5.0, noobj=1.0` (เดิม 1.0/1.0) ให้ตรง YOLOv2-style positive boost

## Status ของแต่ละ Issue

| Issue | Fix | Verified | หมายเหตุ |
|---|---|---|---|
| #1 Build copy | ✅ merged `5567950` | ✅ deploy ได้ปกติ | - |
| #2 V831 ImageNet normalize | ✅ merged `3bf9a32` + `d59b06e` | ⏳ รอ retrain + test board | Classify + voice เท่านั้น YOLO ยังใช้ legacy |
| #3 YOLO BCE loss | ✅ merged `e7f7fb3` | ⏳ รอ verify หลัง retrain | ต้องเช็ค sigmoid(obj)@pos ขึ้นหรือไม่ |

## การ Verify ต่อ (สำหรับ session ถัดไป)

### Verify Issue #3 (BCE loss)

1. เปิด Colab notebook ของ user (ใช้ colab-mcp ถ้ามี)
2. User เทรน YOLO slim ใหม่ด้วย dataset 28 ภาพ 100 epochs → โมเดลจะอยู่ที่ `/content/server/projects/kidbright-mai_6DbDrFt/output/best_map.pth`
3. รัน diagnostic script (เอา content ข้างล่างไป paste ใน Colab cell):

```python
%cd /content/server
code = '''
import os, sys, glob
sys.path.insert(0, "/content/server")
import numpy as np, cv2, torch
import torch.nn.functional as F

proj_dir = "/content/server/projects/kidbright-mai_6DbDrFt"
pth = f"{proj_dir}/output/best_map.pth"

from models.slim_yolo_v2 import SlimYOLOv2
from data.config import ANCHOR_SIZE
import tools
from data.custom import CustomDetection
from data import detection_collate, BaseTransform

device = torch.device("cuda")
nc = 2; labels = ["dog", "phone"]

net = SlimYOLOv2(device, input_size=[224,224], num_classes=nc, anchor_size=ANCHOR_SIZE, trainable=False)
net.load_state_dict(torch.load(pth, map_location=device))
net.to(device).eval()

ds = CustomDetection(root=f"{proj_dir}/dataset", labels=labels, transform=BaseTransform([224,224]))
loader = torch.utils.data.DataLoader(ds, batch_size=4, shuffle=False, collate_fn=detection_collate)
imgs, targets_raw = next(iter(loader))
imgs = imgs.to(device)

targets_list = [t.tolist() for t in targets_raw]
targets = tools.gt_creator(input_size=[224,224], stride=net.stride, label_lists=targets_list, anchor_size=ANCHOR_SIZE)
targets = torch.tensor(targets).float().to(device)

net.no_post_process = True
with torch.no_grad():
    pred = net(imgs)
B, C, H, W = pred.shape
na = 5; step = 1 + 4 + nc
p = pred.permute(0,2,3,1).contiguous().view(B, H*W, na, step)
obj_sig = torch.sigmoid(p[..., 4])

pos_mask_flat = (targets[..., 0] == 1.0)
pos_mask_grid = pos_mask_flat.view(B, H*W, na)
pos_obj = obj_sig[pos_mask_grid]
neg_obj = obj_sig[~pos_mask_grid]
print(f"obj_sigmoid @ POS: mean={pos_obj.mean().item():.3f}, max={pos_obj.max().item():.3f}, N={pos_obj.numel()}")
print(f"obj_sigmoid @ neg: mean={neg_obj.mean().item():.3f}, max={neg_obj.max().item():.3f}")

txtytwth_pred = p[..., 0:4]
x1y1x2y2_pred = (net.decode_boxes(txtytwth_pred) / net.scale_torch).view(-1, 4)
x1y1x2y2_gt = targets[..., 7:11].view(-1, 4)
iou = tools.iou_score(x1y1x2y2_pred, x1y1x2y2_gt).view(B, H*W*na)
pos_iou = iou[pos_mask_flat]
print(f"IoU @ POS: mean={pos_iou.mean().item():.3f}")
print(f"gap: {pos_iou.mean().item() - pos_obj.mean().item():.3f} (before BCE: 0.58)")
'''
with open("/tmp/verify_pos.py", "w") as f: f.write(code)
!conda run -n kbmai --live-stream python /tmp/verify_pos.py 2>&1 | tail -10
```

### เกณฑ์ passing
- `sigmoid(obj) @ POS mean` เพิ่มจาก **0.054 → อย่างน้อย 0.3-0.6** (ใกล้ IoU target)
- gap ลดจาก 0.58 → < 0.2

### ถ้าไม่ผ่าน
- เพิ่ม `obj` weight ใน BCE branch เป็น 10-20 (ตอนนี้ 5.0)
- หรือ normalize BCE ด้วย per-count: `sum/num_pos` vs `sum/num_neg` แทน `sum/batch_size` (ต้องแก้ `tools.BCELoss.forward`)

## รายการ Commits ที่เกี่ยวข้อง

### workspace_ide (branch: main)
- `5567950` — fix: copy nested board/plugin/extension files to dist on build
- `d59b06e` — fix: use ImageNet mean/norm for V831 classify/voice inference

### workspace_server (branch: main)
- `3bf9a32` — fix: use ImageNet mean/norm in V831 calibration for classify/voice
- `e7f7fb3` — fix: use BCE for YOLO objectness loss to prevent gradient vanishing

## TODO หลัง verify รอบนี้

1. ถ้า BCE fix work → convert + deploy YOLO บนบอร์ด ทดสอบ default threshold 0.5
2. Deep dive YOLO V831 preprocessing — ควรใช้ ImageNet stats แบบ classify ด้วยหรือไม่ (ตอนนี้ใช้ legacy 127.5/128)
3. Verify voice mai-plus path — `generators_ai.js:72-73` ใน kidbright-mai-plus ยังใช้ `mean=127.5, norm=1/127.5` ซึ่งอาจ mismatch ถ้า voice บน mai-plus ใช้ tpu-mlir path
4. เช็ค MFCC transpose mismatch ที่ `Knowledge.trace.md` กล่าวไว้ — confirmed เป็น false alarm (voice_mfcc.py ใช้ doMfcc ตัว (13,nframes) ไม่ใช่ doMfcc แบบ (nframes,13) ที่ voice_stream.py มีแต่ไม่ได้เรียก)

## Conventions & Hard Constraints

1. **AWNN normalization formula**: `x' = (x - mean) * norm` โดย `norm = 1/std` (multiplier)
2. **ImageNet stats ต้องคูณ 255**: `mean = [0.485,0.456,0.406] × 255 = [123.675, 116.28, 103.53]`, `norm = 1/([0.229,0.224,0.225] × 255)`
3. **YOLO slim output shape**: `(7, 7, 5*(1+4+num_classes))` interleaved per anchor `[xywh(4), obj(1), cls(nc)]`
4. **MFCC pipeline** (voice): `RATE=44100, FrameLen=1764, FrameShift=882, FFTLen=2048, nFilters=40, mfccCoefs=13` → output shape `(13, ~148)` save เป็น grayscale PNG
5. **`pil_loader` ใน torchvision ImageFolder** อ่าน PNG แล้ว `convert('RGB')` เสมอ → grayscale MFCC จะ replicate เป็น 3 channel อัตโนมัติ
