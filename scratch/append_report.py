# -*- coding: utf-8 -*-
section_text = """

### 4.11 การตรวจสอบและส่งสถานะการเรียกใช้ Block Display Camera ไปยัง index.html และ Unity (1 หรือ 0)
* **ข้อกำหนด**:
  - ตรวจสอบว่าเดิมมีการส่งข้อมูลเมื่อเรียกใช้ Block display camera มายัง Unity หรือยัง
  - หากยังไม่มี: ถ้าเรียกใช้ Block display camera ให้ส่งค่า `1` มาให้ `src/static/KMV/index.html` แต่ถ้าไม่ได้เรียกใช้ ให้ส่งค่า `0` มาให้ `index.html`
* **ผลการตรวจสอบระบบเดิม**:
  - เดิมในบล็อก Generator ของกล้อง (`maix3_display_camera`, `display_camera`, `maix4_display_camera`) สร้างโค้ดแสดงผลบนจอ LCD ตามปกติ (`display.show(camera.capture())` หรือ `disp.show(cam.read())`) **ยังไม่มีการส่งสถานะหรือสัญญาณ 1/0 มายัง `index.html` หรือ Unity**
* **การพัฒนาและปรับปรุง**:
  1. **Blockly Generators (`boards/kidbright-mai/blocks/generators_basic.js`, `boards/kidbright-mai-plus/blocks/generators_basic.js`, `boards/kidbright-mai/blocks/generators_maix_v4.js`)**:
     - เพิ่มคำสั่งส่งสถานะกล้องผ่าน `js.writePinToKMV('DISPLAY_CAMERA', '1')` โดยครอบด้วยบล็อก `try...except Exception: pass`
     - การครอบด้วย `try...except` ทำให้เมื่อนำโค้ดไป Upload ใส่บอร์ดไมโครคอนโทรลเลอร์จริง จะข้ามโมดูล `js` ได้อย่างปลอดภัย 100% ไม่เกิด Exception รันได้ตามปกติ
  2. **Pyodide Runtime & Scanner (`src/store/simulator.js`)**:
     - ใน `CodeToSim(code)`: เพิ่มการสแกนโค้ด Python ล่วงหน้า หากพบว่ามีการใช้บล็อก `display camera` หรือคำสั่งกล้อง จะส่ง `writePinToKMV('DISPLAY_CAMERA', '1')` ทันที หากไม่มีการเรียกใช้ จะส่ง `writePinToKMV('DISPLAY_CAMERA', '0')`
     - ใน `_MockCamera` (Pyodide): เพิ่มการส่งสัญญาณ `DISPLAY_CAMERA: '1'` ในเมธอด `capture()` และ `read()` ทุกครั้งที่มีการอ่านภาพจากกล้อง
     - ใน `stopSimulatorPython()` และ `onSimulatorFinish()`: รีเซ็ตสถานะกล้องกลับเป็น `writePinToKMV('DISPLAY_CAMERA', '0')` เมื่อหยุดโปรแกรม
     - ใน `PIN_MAP`: เพิ่มการจับคู่ `DISPLAY_CAMERA` และ `CAMERA`
  3. **Simulator Controller (`src/components/SimulatorController.vue`)**:
     - ใน `onIframeLoaded()`: ส่งค่าสถานะกล้องเริ่มต้น (`DISPLAY_CAMERA: 0`) ไปยัง Iframe
     - ใน `writePinToKMV(pin, val)`: ส่งค่า `DISPLAY_CAMERA` และ `CAMERA` ไปยัง Iframe และเรียก `iframeWin.setDisplayCamera(val)`
  4. **KMV Iframe (`src/static/KMV/index.html`)**:
     - เพิ่มแท็ก DOM `<p id="DISPLAY_CAMERA">0</p>` และ `<p id="CAMERA">0</p>` ในแท็ก `<details>`
     - ในฟังก์ชัน `window.setPinState(pin, value)`: ดักจับ `DISPLAY_CAMERA` / `CAMERA` เพื่ออัปเดต DOM Element และส่งข้อความต่อไปยัง Unity C# ผ่าน `gameInstance.SendMessage("[ComunicationIDE]", "SetPinState", "DISPLAY_CAMERA:" + value)` รวมถึงส่งต่อไปยัง `GameManager.enableWebcam`
     - เพิ่มฟังก์ชัน `window.setDisplayCamera(value)` ให้สคริปต์ภายนอกสามารถเรียกควบคุมกล้องได้โดยตรง
"""

with open(r'c:\KMV\kidbright_MAI_ide\Report.md', 'a', encoding='utf-8') as f:
    f.write(section_text)
print('Successfully appended section 4.11 to Report.md')
