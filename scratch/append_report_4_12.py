# -*- coding: utf-8 -*-
section_text = """

### 4.12 การเพิ่มการส่งสถานะและพารามิเตอร์ของ Block Draw Text ไปยัง index.html (0 หรือ 1 พร้อมข้อความ, พิกัด x y, สี 1-70, scale)
* **ข้อกำหนด**:
  - เมื่อไม่มีการเรียกใช้ Block `draw text` ให้ส่งค่า `0` มาให้กับ `src/static/KMV/index.html`
  - เมื่อมีการเรียกใช้ Block `draw text` ให้ส่งค่า `1` ต่อด้วย `ข้อความ (text)`, `ตำแหน่ง x y`, `ค่าสี (1-70)` และ `scale` มาให้กับ `index.html`
* **การพัฒนาและปรับปรุง**:
  1. **Blockly Generators (`boards/kidbright-mai/blocks/generators_basic.js`, `boards/kidbright-mai-plus/blocks/generators_basic.js`, `boards/kidbright-mai/blocks/generators_maix_v4.js`)**:
     - อัปเดต Generator ของบล็อก `draw text` (`maix3_draw_string`, `display_draw_string`, `maix4_draw_string`)
     - คำนวณค่าสี `color_idx` (1-70) จาก Palette 70 สี
     - เพิ่มคำสั่งส่งสถานะและพารามิเตอร์ผ่าน `js.writePinToKMV('DRAW_TEXT', '1,%s,%s,%s,%s,%s' % (str(value_text), str(value_x), str(value_y), color_idx, str(value_scale)))` โดยครอบด้วย `try...except Exception: pass`
     - ปลอดภัยต่อการอัปโหลดโค้ดไปยังบอร์ดจริง 100%
  2. **Pyodide Runtime & Scanner (`src/store/simulator.js`)**:
     - ใน `CodeToSim(code)`: สแกนโค้ด Python หากไม่พบบล็อก `draw text` จะส่ง `writePinToKMV('DRAW_TEXT', '0')` และหากพบคำสั่งก่อนเข้าลูปแรกจะดึงพารามิเตอร์ส่งทันที
     - ใน `_MockImage` (Pyodide): เมธอด `draw_string()` ส่งสัญญาณ `DRAW_TEXT` พร้อมพารามิเตอร์ `1,text,x,y,color,scale`
     - ใน `stopSimulatorPython()` และ `onSimulatorFinish()`: รีเซ็ตสถานะกลับเป็น `writePinToKMV('DRAW_TEXT', '0')` เมื่อหยุดโปรแกรม
     - ใน `PIN_MAP`: เพิ่มการจับคู่ `DRAW_TEXT` และ `DISPLAY_DRAW_TEXT`
  3. **Simulator Controller (`src/components/SimulatorController.vue`)**:
     - ใน `onIframeLoaded()`: ส่งค่าเริ่มต้น `DRAW_TEXT: 0` ไปยัง Iframe ทันทีที่โหลดเสร็จ
     - ใน `writePinToKMV(pin, val)`: ส่งต่อค่า `DRAW_TEXT` ไปยัง `iframeWin.setPinState` และเรียก `iframeWin.setDrawText(val)`
  4. **KMV Iframe & Unity Bridge (`src/static/KMV/index.html`)**:
     - เพิ่มแท็ก DOM ใน `<details>`:
       - `<p id="DRAW_TEXT">0</p>` (เก็บค่าดิบ e.g. "0" หรือ "1,Hello,10,20,10,1")
       - `<p id="DRAW_TEXT_STATUS">0</p>` (0 หรือ 1)
       - `<p id="DRAW_TEXT_CONTENT"></p>` (ข้อความ)
       - `<p id="DRAW_TEXT_X">0</p>`
       - `<p id="DRAW_TEXT_Y">0</p>`
       - `<p id="DRAW_TEXT_COLOR">0</p>`
       - `<p id="DRAW_TEXT_SCALE">0</p>`
     - ในฟังก์ชัน `window.setPinState(pin, value)`: แยกแยกสตริง `1,text,x,y,color,scale` หรือ `0` เพื่ออัปเดตลง Element ทั้งหมด และส่งต่อไปยัง Unity ผ่าน:
       - `gameInstance.SendMessage("[ComunicationIDE]", "SetPinState", "DRAW_TEXT:" + value)`
       - `gameInstance.SendMessage("[ComunicationIDE]", "SetDrawText", String(value))`
       - `gameInstance.SendMessage("GameManager", "SetDrawText", String(value))`
       - `gameInstance.SendMessage("GameManager", "DrawText", String(value))`
     - เพิ่มฟังก์ชัน `window.setDrawText(statusOrVal, text, x, y, color, scale)` รองรับทั้งการเรียกแบบพารามิเตอร์แยก หรือส่งสตริงรวม
"""

with open(r'c:\KMV\kidbright_MAI_ide\Report.md', 'a', encoding='utf-8') as f:
    f.write(section_text)
print('Successfully appended section 4.12 to Report.md')
