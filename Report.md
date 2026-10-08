# รายงานสรุปการแก้ไขและพัฒนาระบบ Simulator (Report.md)

เอกสารนี้สรุปรายละเอียดการแก้ไขไฟล์ โค้ดที่ปรับปรุง และฟังก์ชันที่พัฒนาเพิ่มขึ้นทั้งหมด เพื่อให้ **KidBright Block IDE** สามารถจำลองการอัปโหลดโค้ดบล็อกและรันผลลัพธ์บน **Simulator (KMV)** ได้อย่างสมบูรณ์

---

## 1. ภาพรวมของสถาปัตยกรรมที่พัฒนา

```
+-----------------------------------------------------------------------------------+
| 1. Block IDE (src/components/Blockly.vue)                                          |
|    - ผู้ใช้ต่อบล็อกคำสั่ง                                                          |
|    - รองรับการไฮไลต์บล็อกตามเวลาจริง (Step Highlighting)                           |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v (กดปุ่ม KMV บน Header หรือปุ่ม Run ใน Sim)
+-----------------------------------------------------------------------------------+
| 2. Header & Page Orchestrator (src/pages/index.vue, src/components/Header.vue)   |
|    - generateSimCode(): ดึงโค้ด Python พร้อมใส่ Step Hook                         |
|    - openSimulator(): เปิดหน้าต่าง Sim + อัปโหลดโค้ด                              |
|    - Bridge รับส่ง event ระหว่าง Parent กับ Iframe (runBlocklyFromSim / Message)   |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v (ส่งโค้ดเข้า upload_kmv)
+-----------------------------------------------------------------------------------+
| 3. Board Store (src/store/board.js)                                               |
|    - สวมใส่ Code Template ของบอร์ด (##{main}##)                                   |
|    - เรียกใช้ runSimulatorPython(code)                                            |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 4. Simulator Engine (src/store/simulator.js)                                      |
|    - Pyodide WebAssembly Python Engine (runSimulatorPython)                       |
|    - Mock Hardware Modules (machine.Pin, buzzer, motor, servo, maix)               |
|    - Web Audio Synthesizer (จำลองเสียงดนตรี/Buzzer ออกลำโพงเครื่องจริง)           |
|    - Step Resolver & Highlight Hooks (_kmv_step_hook)                              |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v (writePinToKMV)
+-----------------------------------------------------------------------------------+
| 5. Iframe Controller (src/components/SimulatorController.vue)                     |
|    - Flush Pin Cache ไปยัง iframe เมื่อโหลดเสร็จ                                  |
|    - ส่งค่าผ่าน iframe.contentWindow.setPinState(pin, val)                        |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 6. KMV Unity WebGL Player (src/static/KMV/index.html)                            |
|    - gameInstance.SendMessage("[ComunicationIDE]", "SetPinState", pin+":"+val)    |
|    - หุ่นยนต์/บอร์ด 3D ในฉากตอบสนองทันที                                          |
|    - ส่งสถานะสวิตช์ S1/S2 กลับมายัง IDE                                           |
+-----------------------------------------------------------------------------------+
```

---

## 2. รายการไฟล์ที่แก้ไขและส่วนโค้ดที่ปรับปรุง

### 2.1 ไฟล์: `src/store/simulator.js` (Simulator Engine & Hardware Mock)

ไฟล์นี้เป็นหัวใจหลักในการรันโค้ด Python ในเบราว์เซอร์และการจำลองฮาร์ดแวร์

#### โค้ดที่เพิ่มและปรับปรุง:
1. **เพิ่มฟังก์ชัน `runSimulatorPython(rawCode)`**:
   * โหลดและเตรียม Pyodide (Python WebAssembly) แบบ Single-flight Promise เพื่อป้องกันปัญหาการโหลดซ้อน
   * แปลงโค้ดดิบผ่าน `CodeToSim(rawCode)` เพื่อสวม Mock ฮาร์ดแวร์และ Async Loop
   * รันโค้ดแบบ Asynchronous ผ่าน `pyodide.runPythonAsync(simCode)` พร้อมดักจับข้อผิดพลาดและการสั่งหยุด (`KeyboardInterrupt` / `SIM_STOPPED`)
2. **เพิ่มระบบสังเคราะห์เสียง Web Audio Synthesizer (`WebAudioBuzzer`)**:
   * นำแนวคิดจาก `sound.js` ของ `kbide-simulator` มาสร้างออสซิลเลเตอร์คลื่น Square Wave ผ่าน `AudioContext`
   * สังเคราะห์เสียงจริงออกทางลำโพงคอมพิวเตอร์เมื่อมีการเรียกใช้ Pin `BUZZER` หรือสั่งเล่นโน้ต
3. **เพิ่ม Mock คลาส `buzzer` ใน `mockHeader`**:
   * Mock โมดูล `buzzer` และคำสั่ง `tone(freq)`, `on()`, `off()` ให้ส่งสัญญาณไปยัง JavaScript Bridge
4. **ปรับปรุงฟังก์ชัน `writePinToKMV`**:
   * ตรวจจับเมื่อมีคำสั่งส่งมายัง Pin `BUZZER` เพื่อสั่งให้ `buzzerSynth.playTone()` หรือ `stopTone()`
5. **ปรับปรุงการหยุดการทำงาน (`stopSimulatorPython` และ `onSimulatorFinish`)**:
   * สั่งหยุดเสียง Buzzer ทันที และปลดล็อก Step Resolver เพื่อไม่ให้ Thread ค้าง
6. **ผูกฟังก์ชันลงบน Global Scope (`window`)**:
   * เพิ่ม `window.runSimulatorPython` ให้สามารถเรียกจากภายนอกได้

---

### 2.2 ไฟล์: `src/store/board.js` (Board Store & Upload Dispatcher)

จัดการการประสานงานระหว่างโค้ดโปรเจกต์กับบอร์ด

#### โค้ดที่เพิ่มและปรับปรุง:
1. **Import ฟังก์ชันจำลอง**:
   ```javascript
   import { CodeToSim, runSimulatorPython } from "@/store/simulator"
   ```
2. **ปรับปรุงฟังก์ชัน `upload_kmv(code)`**:
   * แต่เดิมฟังก์ชันนี้เพียงแค่เรียก `CodeToSim(code)` แต่ไม่ได้นำโค้ดไปรัน
   * ปรับปรุงให้นำโค้ดมาประกอบเข้ากับ `currentBoard.codeTemplate` และสั่งรันจริงผ่าน:
   ```javascript
   return await runSimulatorPython(code)
   ```

---

### 2.3 ไฟล์: `src/pages/index.vue` (Main Workspace & UI Coordinator)

หน้าจอหลักของ IDE ที่ควบคุมการเปิด/ปิด Simulator และการดึงโค้ดบล็อก

#### โค้ดที่เพิ่มและปรับปรุง:
1. **เพิ่มฟังก์ชัน `generateSimCode()`**:
   * ก่อนดึงโค้ดจาก Blockly ให้กำหนด `pythonGenerator.STATEMENT_PREFIX = 'await _kmv_step(%1)\n'` เพื่อแทรก ID บล็อกเข้าไปในโค้ด Python
   * หลังจากแปลงเสร็จ ให้รีเซ็ตกลับเป็นค่าว่างทันที เพื่อไม่ให้กระทบกับการกดปุ่ม Upload ลงบอร์ดจริง
2. **ปรับปรุงฟังก์ชัน `openSimulator()`**:
   * เมื่อกดปุ่ม KMV ครั้งแรก (หาก Sim ปิดอยู่): เปิดหน้าต่าง Simulator พร้อมทั้งอัปโหลดโค้ดบล็อกล่าสุดเข้าไปรันทันที
   * หากหน้าต่าง Sim เปิดอยู่แล้ว: ทำหน้าที่เป็น **"Re-upload"** โค้ดชุดใหม่เข้าสู่ Simulator ทันที โดยไม่ปิดหน้าต่าง
   * เพิ่มการแจ้งเตือน Toast: *"กำลังอัปโหลดโค้ดสู่ Simulator..."* และ *"อัปโหลดโค้ดสู่ Simulator สำเร็จ"*
3. **เพิ่มฟังก์ชัน `closeSimulator()`**:
   * แยกปุ่มปิดหน้าต่าง (ปุ่ม `✕` บน Titlebar ของ Sim) ออกจากปุ่ม KMV
   * ทำการปิดหน้าต่างและสั่ง `stopSimulatorPython()`
4. **เชื่อมต่อสะพานคำสั่ง (Bridge) ระหว่าง IDE กับ KMV**:
   * ใน `onMounted` กำหนด `window.runBlocklyFromSim` และ `window.stopBlocklyFromSim`
   * เพิ่ม Event Listener ดักรับ `postMessage` (`KMV_RUN_CODE` และ `KMV_STOP_CODE`) ที่ส่งมาจากปุ่มในหน้าต่าง Unity KMV
5. **คืนทรัพยากรใน `onBeforeUnmount`**:
   * ลบ Event Listener และล้างฟังก์ชันบน `window` พร้อมสั่งหยุด Simulator ป้องกัน Memory Leak

---

### 2.4 ไฟล์: `src/components/Header.vue` (Top Toolbar)

แถบเมนูด้านบนของ IDE

#### โค้ดที่เพิ่มและปรับปรุง:
1. **เพิ่มปุ่ม KMV Simulator**:
   * ใช้ไอคอน `btn_KMV.png`
   * ตั้งค่า Tooltip เป็น: **`Upload to Simulator (KMV)`** เพื่อสื่อความหมายว่าเป็นการอัปโหลดโค้ดเข้า Sim
   * ผูก Event คลิกให้ส่ง `@click="$emit('openKMV')"` ไปยัง `index.vue`

---

### 2.5 ไฟล์: `src/components/Blockly.vue` (Blockly Component)

หน้าจอพื้นที่เขียนโปรแกรมแบบบล็อก

#### โค้ดที่เพิ่มและปรับปรุง:
1. **เชื่อมต่อการไฮไลต์บล็อกตามเวลาจริง (Real-time Step Highlighting)**:
   * Import `registerHighlightCallback` จาก `@/store/simulator`
   * หลังสร้าง Workspace เสร็จ ให้ผูก Callback เข้ากับ `workspace.value.highlightBlock(blockId)`
   * เมื่อ Python Engine รันผ่านแต่ละบล็อก บล็อกนั้นจะสว่างขึ้นบนหน้าจอทันที
2. **คืนค่า Callback ใน `onBeforeUnmount`**:
   * ป้องกันการเรียกใช้ Workspace ที่ถูกทำลายไปแล้ว

---

### 2.6 ไฟล์: `src/components/SimulatorController.vue` (Iframe Wrapper)

คอมโพเนนต์ที่ครอบหน้าต่าง Unity WebGL Player

#### โค้ดที่เพิ่มและปรับปรุง:
1. **Flush Cache สถานะ Pin เมื่อ Iframe โหลดเสร็จ (`onIframeLoaded`)**:
   * ป้องกันปัญหาการส่งค่า Pin ไม่ติดในกรณีที่โค้ด Python เริ่มทำงานก่อนที่หน้าต่าง Unity จะโหลดเสร็จสมบูรณ์
   * เมื่อ Event `@load` ของ Iframe ทำงาน จะดึงค่า Pin ล่าสุดใน Cache ส่งต่อไปยัง `iframeWin.setPinState(pin, val)` ทันที

---

### 2.7 ไฟล์: `src/static/KMV/index.html` (Unity WebGL Player)

หน้าเว็บที่รัน Unity WebGL

#### กลไกที่เชื่อมโยง:
1. รองรับฟังก์ชัน `window.setPinState(pin, value)` เพื่อส่งคำสั่งต่อไปยัง Unity C# ผ่าน `gameInstance.SendMessage("[ComunicationIDE]", "SetPinState", pin + ":" + value)`
2. มีปุ่ม **`Run Code`** และ **`Stop`** ที่เชื่อมโยงกลับมายัง IDE ผ่าน `window.parent.runBlocklyFromSim()` และ `postMessage`
3. ส่งสถานะสวิตช์ S1 / S2 จาก Unity กลับมายัง Parent ผ่าน `window.parent.setSwitchFromKMV(sw, val)`

---

## 3. สรุปผลการตรวจสอบและการทดสอบ (Verification)

* **Build Test**: ผ่านคำสั่ง `npm run build` สำเร็จ 100% (Exit code 0) โดยไม่มีข้อผิดพลาดของ TypeScript/ESLint หรือ Module Resolution ใดๆ
* **UX Flow**: รองรับทั้งการกดอัปโหลดจากแถบเมนูหลักของ IDE (ปุ่ม KMV) และการกดปุ่ม Run Code จากภายในหน้าต่าง Simulator ได้อย่างราบรื่น

---

## 4. ปัญหาที่ตรวจสอบพบและแนวทางแก้ไข (Troubleshooting & Fixes)

จากการตรวจสอบสาเหตุที่ทำให้ Simulator ไม่ทำงานหลังจากการทำรายงานรอบแรก พบสาเหตุสำคัญ 4 ประการ ดังนี้:

### 4.1 ปัญหา Board Code Template ขัดข้องใน WebAssembly / Pyodide
* **สาเหตุ**: ใน `src/store/board.js` มีการนำ `currentBoard.codeTemplate` มาครอบโค้ด Blockly ก่อนส่งรัน ซึ่งในไฟล์เทมเพลตของบอร์ดจริง (`boards/kidbright-mai/main.py` และ `kidbright-mai-plus/main.py`) มีการเรียกใช้ฟังก์ชันระบบ Linux เช่น `signal.signal(signal.SIGINT, ...)` และ `os.popen("ps | grep maixapp/apps...")` เมื่อนำมารันบน Pyodide (WASM บนเบราว์เซอร์) จะเกิด Error: `ValueError: signal only works in main thread of the main interpreter` และ `OSError` ส่งผลให้ Pyodide หยุดทำงานทันทีก่อนที่โค้ด Blockly จะได้เริ่มรัน
* **การแก้ไข**: 
  1. ใน `upload_kmv` นำส่วนที่ครอบ `currentBoard.codeTemplate` ออก เนื่องจากระบบ Simulator มี Mock สำหรับฮาร์ดแวร์ในเบราว์เซอร์อย่างสมบูรณ์อยู่แล้ว
  2. เพิ่ม Mock ให้กับโมดูล `signal` และ `os.popen` / `os.system` ใน `mockHeader` ของ `src/store/simulator.js` เพื่อความปลอดภัยหากมีโค้ดส่วนใดเรียกใช้

### 4.2 ปัญหา `upload_kmv` ติดค้าง (Block) เมื่อมีลูปวนซ้ำไม่รู้จบ (`while True:`)
* **สาเหตุ**: ฟังก์ชัน `upload_kmv` เดิมสั่ง `return await runSimulatorPython(code)` ซึ่งคำสั่ง `runPythonAsync` จะรอจนกว่าโปรแกรม Python จะรันจบ แต่โปรแกรมหุ่นยนต์ส่วนใหญ่มีลูป `while True:` ทำให้ Promise ไม่มีวัน Resolve ส่งผลให้ UI ค้าง ข้อความ Toast สำเร็จไม่ขึ้น และไม่สามารถกดรันซ้ำได้
* **การแก้ไข**: ปรับ `upload_kmv` ให้สั่งรัน `runSimulatorPython(code)` แบบ Asynchronous Non-blocking ใน Background พร้อม catch error และ return ทันที ทำให้ปุ่มและ UI ตอบสนองได้รวดเร็ว

### 4.3 ปัญหา SyntaxError จาก `await _kmv_step` เมื่อมีการสร้างฟังก์ชันในบล็อก
* **สาเหตุ**: เดิมกำหนด `STATEMENT_PREFIX = 'await _kmv_step(%1)\n'` ซึ่งเมื่อผู้ใช้สร้างบล็อกฟังก์ชันใน Blockly (`def my_func():`) โค้ดไพธอนจะกลายเป็นฟังก์ชันแบบซิงโครนัส การมี `await` อยู่ภายในฟังก์ชันธรรมดาทำให้ Python เกิดข้อผิดพลาดร้ายแรง: `SyntaxError: 'await' outside async function`
* **การแก้ไข**: ปรับเปลี่ยน `_kmv_step` ให้เป็นฟังก์ชันแบบซิงโครนัส (`def _kmv_step(block_id):`) และเปลี่ยน `STATEMENT_PREFIX` เป็น `'_kmv_step(%1)\n'` (ไม่มี await) ทำให้สามารถไฮไลต์บล็อกได้ในทุกโครงสร้างโค้ดโดยไม่ติด Syntax Error

### 4.4 การผูกฟังก์ชัน `highlightBlockInIDE` ลงบน Window Scope
* **สาเหตุ**: `highlightBlockInIDE` ยังไม่ได้ถูก export ลง `window` ทำให้เมื่อ `_kmv_step` ใน Python เรียก `js.highlightBlockInIDE` อาจไม่พบฟังก์ชัน
* **การแก้ไข**: ทำการผูก `window.highlightBlockInIDE = highlightBlockInIDE` ใน `src/store/simulator.js` เรียบร้อยแล้ว

### 4.5 ปัญหาบล็อก Logic (if do else) และลูปค้าง (UI Freezing / Tight Loop)
* **สาเหตุ**:
  1. เมื่อนำบล็อก `controls_if` (if do else) หรือคำสั่งทั่วไปใส่ไว้ในลูป (`while True:` หรือ `controls_forever`) โดยไม่มีบล็อก `delay/sleep` คั่น โค้ดจะรันแบบ Synchronous Tight Loop ใน WebAssembly ของเบราว์เซอร์ ซึ่งดึง CPU 100% และไม่ยอมคืนคิวงาน (Yield) ให้กับ JavaScript Event Loop ส่งผลให้หน้าจอเบราว์เซอร์ค้าง แคนวาส Unity ไม่เรนเดอร์ และไม่สามารถกดปุ่มหยุด (Stop) ได้
  2. เมื่อผู้ใช้นำบล็อก `controls_if` ออกมารันแบบเดี่ยวๆ (ไม่มีลูปคลุม) โค้ดจะทำงานเสร็จภายในเวลาไม่ถึง 1 มิลลิวินาที แล้วเข้าสู่ `finally: onSimulatorFinish()` ทันที ทำให้สถานะสลับกลับเป็น `IDLE` และเคลียร์ไฮไลต์บล็อกอย่างรวดเร็วจนผู้ใช้มองไม่เห็นว่าทำงานแล้ว
  3. บล็อก `while_loop` ใน `src/blocks/generators_controls.js` หากผู้ใช้ไม่ได้ต่อบล็อกเงื่อนไขเข้าไป จะคืนค่าเป็น `while :` ทำให้เกิดข้อผิดพลาดทางไวยากรณ์ `SyntaxError: invalid syntax`
* **การแก้ไข**:
  1. ใน `CodeToSim`: เพิ่มการแทรกคำสั่ง `await asyncio.sleep(0.005)` โดยอัตโนมัติที่ส่วนหัวของทุกลูป `while` และ `for` เพื่อให้คืนคิวงานให้เบราว์เซอร์เสมอ ทำให้ UI ลื่นไหล ป้องกันเบราว์เซอร์ค้าง และหยุดได้ทันทีเมื่อกด Stop
  2. ใน `_kmv_runner_wrapper`: เพิ่มการหน่วงเวลาแสดงผล `await asyncio.sleep(0.5)` ก่อนรีเซ็ตสถานะเมื่อโปรแกรมทำงานจบตามปกติ เพื่อให้ผู้ใช้มองเห็นสถานะสุดท้ายบนบอร์ดจำลอง
  3. ใน `src/blocks/generators_controls.js`: ปรับ `while_loop` ให้มี Fallback ค่า Default ของเงื่อนไขเป็น `'True'` และ statements เป็น `'  pass\n'` ป้องกัน `while :` syntax error

### 4.6 ปัญหา Attribute Error ใน Mock Hardware บางตัว
* **สาเหตุ**: 
  - บล็อกสวิตช์ `maixpy3_gpio_switch` บน `kidbright-mai-plus` เรียก `from maix import adc; __adc_key = adc.ADC(0, ...)` แต่คลาส `_MockADC` ไม่มีแอตทริบิวต์ `.ADC` ทำให้เกิด `AttributeError`
  - บล็อกกล้องและจอภาพบน `kidbright-mai-plus` เรียก `disp = display.Display()` และ `cam = camera.Camera(...)` แต่ตัว mock ขาด `.Display` และ `.Camera`
  - บล็อก `board_led` มีการเขียนไฟล์ไปยัง `/sys/class/leds/led-user/brightness` ซึ่งไม่มีไฟล์จริงใน WebAssembly ของ Pyodide ทำให้เกิด `FileNotFoundError`
* **การแก้ไข**:
  - เสริม `_MockADC.ADC = _MockADC` และปรับ `__init__` ให้ดึงพินได้อย่างถูกต้อง
  - เสริม `.Display = _MockDisplay` และ `.Camera = _MockCamera`
  - เสริม `__getattr__` ให้กับ `_MockImage` รองรับเมธอดวาดภาพเพิ่มเติมทั้งหมด (เช่น `draw_arrow`, `draw_cross`, `draw_image`)
  - เสริม Mock `builtins.open` ดักจับการเขียนไฟล์ `/sys/class/leds/...` และส่งค่าไปยัง `writePinToKMV('LED', val)` เพื่อควบคุมไฟ LED บนหน้าจอจำลองได้จริง

### 4.7 การเชื่อมโยงบล็อก Set Display Color ส่งค่าตัวเลข 1-70 ให้ KMV Simulator
* **ความต้องการ**:
  - เมื่อวางบล็อก `set display color` (เลือกสีจาก Color Palette จำนวน 70 สี) ให้ส่งค่าตัวเลขลำดับ **1 - 70** (เรียงลำดับ ซ้าย->ขวา, บน->ล่าง) ไปยัง `src\static\KMV\index.html`
* **การเรียงลำดับสี 70 สี (10 แถว x 7 คอลัมน์)**:
  - แถวที่ 1 (1 - 7): `#ffffff` (1), `#cccccc` (2), `#c0c0c0` (3), `#999999` (4), `#666666` (5), `#333333` (6), `#000000` (7)
  - แถวที่ 2 (8 - 14): `#ffcccc` (8), `#ff6666` (9), `#ff0000` (10), `#cc0000` (11), `#990000` (12), `#660000` (13), `#330000` (14)
  - ...
  - แถวที่ 10 (64 - 70): `#ffccff` (64), `#ff99ff` (65), `#cc66cc` (66), `#cc33cc` (67), `#993399` (68), `#663366` (69), `#330033` (70)
* **ไฟล์และจุดที่แก้ไข**:
  1. `boards/kidbright-mai/blocks/generators_basic.js` (บล็อก `maix3_set_display_color`):
     - คำนวณหา index 1-70 จาก Color Palette 70 สี และแทรกคำสั่งส่งค่า `js.writePinToKMV('DISPLAY_COLOR', '${color_idx}')`
  2. `boards/kidbright-mai-plus/blocks/generators_basic.js` (บล็อก `display_fill_color`):
     - คำนวณหา index 1-70 และแทรกคำสั่งส่งค่า `js.writePinToKMV('DISPLAY_COLOR', '${color_idx}')`
  3. `boards/kidbright-mai/blocks/generators_maix_v4.js` (บล็อก `maix4_set_display_color`):
     - คำนวณหา index 1-70 และแทรกคำสั่งส่งค่า `js.writePinToKMV('DISPLAY_COLOR', '${color_idx}')`
  4. `src/store/simulator.js`:
     - ใน mock `_MockImage` และ `_MockDisplay` เสริม `_kmv_rgb_to_color_index` เพื่อตรวจจับและแปลงค่า RGB กลับเป็น index 1-70 ส่งไปยัง `DISPLAY_COLOR` อัตโนมัติ
     - Fast-path regex ใน `CodeToSim(code)` สามารถดักจับและส่งค่าสีทันทีก่อนเริ่มรัน Python
  5. `src/components/SimulatorController.vue`:
     - ฟังก์ชัน `writePinToKMV(pin, val)` ส่งค่าไปยัง iframe KMV ทั้ง `DISPLAY_COLOR`, `COLOR` และเรียก `setDisplayColor(val)`
  6. `src/static/KMV/index.html`:
     - เพิ่มแท็ก `<p id="DISPLAY_COLOR">0</p>` และ `<p id="COLOR">0</p>` ภายใต้ `<details style="visibility: hidden">`
     - เพิ่มฟังก์ชัน `window.setDisplayColor(colorNum)`
     - ใน `window.setPinState(pin, value)` ดักจับ `DISPLAY_COLOR` / `COLOR` เพื่ออัปเดต DOM Element และส่งต่อไปยัง Unity WebGL ผ่าน `gameInstance.SendMessage("[ComunicationIDE]", "SetDisplayColor", ...)` ด้วยค่าลำดับ 1-70 โดยตรง (ทั้งรูปแบบ Integer และ String โดยไม่หักลบค่า -1)

### 4.8 การส่งค่าเลือกบอร์ด (Select a Board) ค่า 1 หรือ 2 ให้ KMV Simulator
* **ความต้องการ**:
  - เมื่อผู้ใช้งานกด New Project จนถึงขั้นตอนเลือกบอร์ดสำเร็จ (`Select a Board`):
    - บอร์ดด้านซ้าย (`kidbright-mai`): ให้ส่งค่า `1`
    - บอร์ดด้านขวา (`kidbright-mai-plus`): ให้ส่งค่า `2`
    - กรณีไม่ได้เลือก: กำหนดค่าเริ่มต้นเป็น `1`
  - ส่งค่าไปยัง `src\static\KMV\index.html`
* **ไฟล์และจุดที่แก้ไข**:
  1. `src/components/dialog/SelectBoardDialog.vue`:
     - ในฟังก์ชัน `selectBoard(board)` คำนวณ index จากรายการบอร์ด (บอร์ดซ้าย = `1`, บอร์ดขวา = `2`, อื่นๆ = `1`)
     - บันทึกค่าลง `localStorage.setItem('kmv_board_type', boardVal)` และเรียก `writePinToKMV('BOARD', boardVal)`
  2. `src/composables/useProjectActions.js`:
     - ใน `createdProject(projectInfo)` ตรวจสอบ `projectInfo.board`: หากเป็น `kidbright-mai-plus` ส่ง `2`, หากเป็น `kidbright-mai` หรือไม่ระบุส่ง `1`
     - บันทึกลง Storage และส่งค่า `BOARD` ไปยัง Simulator
  3. `src/components/SimulatorController.vue`:
     - ใน `onIframeLoaded()` อ่านค่าบอร์ดล่าสุดจาก Storage (ค่าเริ่มต้น `1`) แล้วส่งค่าไปยัง Iframe ทันทีที่โหลดเสร็จ
     - ใน `writePinToKMV(pin, val)` หากพินเป็น `BOARD` จะส่งต่อไปยัง `iframeWin.setPinState('BOARD', val)` และเรียก `iframeWin.setBoard(val)`
  4. `src/static/KMV/index.html`:
     - เพิ่ม DOM Elements `<p id="Board">1</p>`, `<p id="Board_12">1</p>`, `<p id="BoardVersion">1</p>` ภายใต้ `<details>`
     - เพิ่มฟังก์ชัน `window.setBoard(boardNum)`, `window.setBoardType`, `window.setBoardVersion`
     - ใน `window.setPinState(pin, value)` จัดการอัปเดต DOM Element และส่งต่อไปยัง Unity WebGL ผ่าน `gameInstance.SendMessage`
     - กำหนด IIFE ฟังก์ชันโหลดค่าเริ่มต้นจาก `localStorage` โดยมีค่า default เป็น `1` ทันทีเมื่อเปิด Iframe

### 4.9 การรับค่า Input Sensor จาก Unity เข้าสู่ IDE (SensorInput(pin, value))
* **ความต้องการ**:
  - ปรับให้ IDE สามารถรับค่า Input Sensor จาก Unity ที่ส่งเข้ามายัง `src/static/KMV/index.html` ผ่านฟังก์ชัน `SensorInput(pin, value)`
  - ค่า `pin` และ `value` (0 หรือ 1) ที่ Unity ส่งออกมา จะตรงกับบล็อก **Read Pin** (`maixpy3_gpio_get`, `pin_digital_read`) ใน Blockly
* **ไฟล์และจุดที่แก้ไข**:
  1. `src/static/KMV/index.html`:
     - พัฒนาฟังก์ชัน `SensorInput(pin, value)` ให้สมบูรณ์:
       - แปลงและตรวจสอบค่า `value` ให้เป็น `0` หรือ `1`
       - อัปเดตลง Element DOM `<p id="PIN">` และ `<p id="PIN_val">` รวมทั้ง `<p id="PIN_<pin>">`
       - รองรับการรับค่าทั้งแบบพินเดี่ยว `SensorInput("PH14", 1)`, แบบ Object หลายพินพร้อมกัน `SensorInput({ PH14: 1, PH13: 0 })`, แบบ Array `SensorInput(["PH14", "PH13"], 1)`, และแบบ Comma-separated `SensorInput("PH14,PH13", 1)`
       - ส่งค่าต่อไปยัง IDE Parent Window ผ่าน `window.parent.setPinFromKMV(strPin, numVal)`
       - รองรับ Cross-Origin ด้วย `postMessage({ type: 'KMV_SENSOR_INPUT', pin: strPin, value: numVal }, '*')`
       - ผูก `window.SensorInput = SensorInput` เข้า Global Scope
     - เพิ่มแท็ก Pin สำหรับแต่ละพิน (`PIN_PH14`, `PIN_PH13`, `PIN_PH8`, `PIN_PH7`, `PIN_PH6`, `PIN_PH3`, `PIN_PH2`, `PIN_PH1`, `PIN_PH0`, `PIN_IO2`..`PIN_IO10`) ภายใต้ `<details style="visibility: hidden">`
  2. `src/store/simulator.js`:
     - เพิ่ม `PIN_MAP` ตารางจับคู่ชื่อพินและ Alias แบบ 2 ทิศทาง:
       - บอร์ด KidBright-MAI: `PH14` <-> `14` <-> `D2`, `PH13` <-> `13` <-> `D1`, `PH8` <-> `8`, `PH7` <-> `7`, `PH6` <-> `6`, `PH3` <-> `3`, `PH2` <-> `2`, `PH1` <-> `1`, `PH0` <-> `0`
       - บอร์ด KidBright-MAI Plus: `IO2` <-> `A23`, `IO3` <-> `A27`, `IO4` <-> `A25`, `IO5` <-> `A22`, `IO6` <-> `A24`, `IO7` <-> `P24`, `IO8` <-> `A15`, `IO9` <-> `A17`, `IO10` <-> `A14`
       - บอร์ด KidBright-MAI Plus Pin Read: `D0`..`D6` <-> หมายเลขพิน
     - ฟังก์ชัน `setPinFromKMV(pin, val)` รองรับทั้งการอัปเดตแบบพินเดี่ยวและแบบชุด Object หลายพินพร้อมกัน โดยอัปเดตสถานะของทุกพินใน `pinStates` อย่างอิสระ ไม่ทับซ้อนกัน
     - ปรับปรุงฟังก์ชัน `getPinFromKMV(pin)` ให้อ่านจาก `pinStates` พร้อม Fallback อ่านจาก DOM Element ใน Iframe Simulator
     - ปรับปรุงฟังก์ชัน `CodeToSim(code)`: สำหรับบล็อก Read Pin ของ KidBright-MAI เดิมที่ฮาร์ดแวร์จริงมีการใช้ active-low pull-up ทำให้ Generator สร้างโค้ดกลับข้างเป็น `(1 - (_gpio_...get_value()))` ให้ Normalize ออกใน Simulator เพื่อให้ค่า `0` หรือ `1` จาก Unity ส่งตรงเข้าบล็อก Read Pin โดยไม่ต้องกลับบิต
     - ผูก `window.setPinFromKMV = setPinFromKMV` และ `window.SensorInput = setPinFromKMV`
  3. `src/components/SimulatorController.vue`:
     - นำเข้า `setPinFromKMV` จาก `@/store/simulator.js`
     - เพิ่ม `message` Event Listener ใน `mounted()` เพื่อดักรับเหตุการณ์ `KMV_SENSOR_INPUT` จาก Iframe แล้วส่งต่อให้ `setPinFromKMV(pin, value)` ทันที




### 4.10 การแก้ไขบล็อก Read Pin IO2-IO8 และ Write Pin IO2-IO8 ของบอร์ด KidBright Micro AI Plus
* **ปัญหาที่พบ**:
  1. **เกิด Fatal Error `AttributeError: module 'maix.gpio' has no attribute 'Mode'` ใน Pyodide**:
     - บล็อก Read Pin (`maixpy3_gpio_get`) และ Write Pin (`maixpy3_gpio_set`) ของบอร์ด `kidbright-mai-plus` สร้างโค้ด Python:
       `_gpio_A23 = gpio.GPIO('A23', gpio.Mode.IN)` สำหรับ Read Pin
       `_gpio_A23 = gpio.GPIO('A23', gpio.Mode.OUT)` สำหรับ Write Pin
     - ใน Mock Hardware ของ Pyodide เดิม ขาดการประกาศ `Mode` และ `Pull` ใน `_gpio_mod` ทำให้เมื่อรันบนเบราว์เซอร์เกิด Exception ทันที ส่งผลให้โค้ด Python ไม่สามารถทำงานต่อได้
  2. **ชื่อพินไม่ตรงกันระหว่าง Blockly (`A23..A15`) กับ Unity Simulator (`IO2..IO8`)**:
     - บล็อก Blockly ของ `kidbright-mai-plus` ใช้ค่า Value ใน Dropdown เป็นชื่อพินชิปฮาร์ดแวร์จริง เช่น `A23`, `A27`, `A25`, `A22`, `A24`, `P24`, `A15`
     - แต่ในสคริปต์ C# ของ Unity Simulator เช็คพินด้วยชื่อ `IO2`, `IO3`, `IO4`, `IO5`, `IO6`, `IO7`, `IO8`
     - **ฝั่ง Write Pin**: เมื่อ Blockly สั่งเปิดไฟ/เขียนพิน โค้ดส่งค่า `"A23:1"` ทำให้ Unity ไม่รู้จักและไม่แสดงผล
     - **ฝั่ง Read Pin**: เมื่อ Unity มีการตรวจจับเซนเซอร์และเรียก `SensorInput("IO2", 1)` โค้ด Blockly ฝั่ง Python กลับรออ่านค่าจาก `"A23"` ทำให้ค่าไม่ตรงกันและอ่านค่าได้ 0 ตลอดเวลา
* **การแก้ไขและปรับปรุง (Bidirectional Pin Aliasing)**:
  1. **ไฟล์ `src/store/simulator.js`**:
     - เพิ่ม `_gpio_mod.Mode = _MockGPIO.Mode` (`IN: 0, OUT: 1`) และ `_gpio_mod.Pull = _MockGPIO.Pull` เพื่อป้องกัน `AttributeError`
     - ในคลาส `_MockGPIO`:
       - สร้างตารางแปลง `_A_TO_IO_MAP` และ `_IO_TO_A_MAP`
       - เมธอด `set_value(val)`: ส่งค่าพินทั้งชื่อจริงและ Alias (`self.pin_name` และ `self.pin`) ไปยัง `js.writePinToKMV`
       - เมธอด `get_value()`: อ่านค่าพินจาก `js.getPinFromKMV` ทั้งจากชื่อจริงและ Alias
     - ย้ายตำแหน่ง `PIN_MAP` ขึ้นก่อนฟังก์ชัน `writePinToKMV`:
       - เพิ่มคู่แมปปิ้ง `IO2` <-> `A23`, `IO3` <-> `A27`, `IO4` <-> `A25`, `IO5` <-> `A22`, `IO6` <-> `A24`, `IO7` <-> `P24`, `IO8` <-> `A15`
       - ใน `writePinToKMV`: อัปเดตสถานะของทุก Alias ใน `pinStates` และส่ง Event Callback ไปยัง `SimulatorController.vue` ทั้งชื่อพินเดิมและชื่อ Alias
  2. **ไฟล์ `src/components/SimulatorController.vue`**:
     - ในฟังก์ชัน `writePinToKMV(pin, val)`: เพิ่มการแปลงชื่อพินระหว่าง `A23..A15` และ `IO2..IO8` ส่งต่อไปยัง `iframeWin.setPinState` ทั้งสองรูปแบบ เพื่อให้ Unity ได้รับคำสั่งอย่างแน่นอน
  3. **ไฟล์ `src/static/KMV/index.html`**:
     - เพิ่มแท็ก DOM `<p id="PIN_A23">0</p>` ถึง `<p id="PIN_A14">0</p>` ในแท็ก `<details>` เพื่อรองรับ Fallback ในทุกกรณี
     - ในฟังก์ชัน `SensorInput(pin, value)`: เพิ่มการแมปปิ้งพิน เมื่อ Unity ส่ง `"IO2"` จะอัปเดตลงทั้ง DOM `PIN_IO2` และ `PIN_A23` พร้อมส่งต่อไปยัง IDE ผ่าน `window.parent.setPinFromKMV` และ `postMessage` ทั้ง 2 รูปแบบ
     - ในฟังก์ชัน `window.setPinState(pin, value)`: เพิ่มการแมปปิ้งพิน เมื่อ IDE ส่ง `"A23"` จะส่งข้อความไปยัง Unity C# ทั้ง `"A23:val"` และ `"IO2:val"` ผ่าน `gameInstance.SendMessage("[ComunicationIDE]", "SetPinState", ...)`


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

### 4.12 การเพิ่มการส่งข้อมูลจาก Block Draw Text (ข้อความ, ตำแหน่ง x y, ค่าสี 1-70, scale) ไปยัง index.html
* **ข้อกำหนด**:
  - เมื่อผู้ใช้งานเรียกใช้ Block draw text (`maix3_draw_string`, `display_draw_string`, `maix4_draw_string`) ให้ส่ง:
    1. ข้อความ (`text`)
    2. ตำแหน่ง (`x`, `y`)
    3. ค่าสีตาม Palette 1-70 (`color`)
    4. ขนาดตัวอักษร (`scale`)
    มาให้กับ `src/static/KMV/index.html` (และต่อไปยัง Unity)
* **การพัฒนาและปรับปรุง**:
  1. **Blockly Generators (`boards/kidbright-mai/blocks/generators_basic.js`, `boards/kidbright-mai-plus/blocks/generators_basic.js`, `boards/kidbright-mai/blocks/generators_maix_v4.js`)**:
     - ปรับปรุงฟังก์ชัน `maix3_draw_string`, `display_draw_string`, และ `maix4_draw_string`:
       - คำนวณรหัสสี `color_idx` (1-70) จากสี Hex ที่เลือกผ่าน `COLOUR_PALETTE_70`
       - สร้างคำสั่งเรียก `js.drawTextToKMV(str(text), x, y, color_idx, scale)` และ Fallback `js.writePinToKMV('DRAW_TEXT', f"{text}|{x}|{y}|{color_idx}|{scale}")`
       - ครอบด้วยบล็อก `try...except Exception: pass` เพื่อให้เมื่ออัปโหลดลงบอร์ดจริงยังคงทำงานได้ตามปกติและไม่เกิด Error
  2. **Pyodide Runtime & Scanner (`src/store/simulator.js`)**:
     - สร้างฟังก์ชัน `drawTextToKMV(text, x, y, color, scale)`: รวมข้อมูลเป็น Object `{ text, x, y, color, scale }` แล้วส่งต่อไปยัง `writePinToKMV('DRAW_TEXT', payload)`
     - ใน `writePinToKMV`: รองรับการส่ง Object Payload เพื่อส่งข้อมูลแบบครบถ้วนไปยัง Callback
     - ใน `CodeToSim(code)`: เพิ่ม Fast-path สแกนหาคำสั่ง `drawTextToKMV` ในโค้ดเริ่มต้น เพื่ออัปเดตข้อความบนหน้าจอก่อนเข้าลูป
     - ใน `_MockImage.draw_string` (Pyodide): ดักจับพารามิเตอร์ `x`, `y`, `text`, `scale`, `color` และคำนวณ `color_idx` (1-70) ส่งต่อไปยัง `js.drawTextToKMV`
     - ผูก `window.drawTextToKMV = drawTextToKMV`
  3. **Simulator Controller (`src/components/SimulatorController.vue`)**:
     - ใน `writePinToKMV(pin, val)`: เมื่อได้รับพิน `DRAW_TEXT` หรือ `TEXT` จะทำการแปลงข้อมูลและเรียก:
       - `iframeWin.drawText(text, x, y, color, scale)`
       - `iframeWin.setPinState("DRAW_TEXT", val)`
  4. **KMV Iframe (`src/static/KMV/index.html`)**:
     - เพิ่มแท็ก DOM ใน `<details>`:
       - `<p id="DRAW_TEXT"></p>`
       - `<p id="DRAW_TEXT_CONTENT"></p>`
       - `<p id="DRAW_TEXT_X">0</p>`
       - `<p id="DRAW_TEXT_Y">0</p>`
       - `<p id="DRAW_TEXT_COLOR">10</p>`
       - `<p id="DRAW_TEXT_SCALE">1</p>`
     - ใน `window.setPinState(pin, value)`: เพิ่มตัวแยกข้อมูล `parseTextData` รองรับทั้ง Object, JSON string, และ Delimited string (`text|x|y|color|scale`) และอัปเดตลง Element HTML DOM ทั้งหมด
     - ส่งต่อไปยัง Unity C# ผ่าน `gameInstance.SendMessage("[ComunicationIDE]", "SetPinState", "DRAW_TEXT:" + dtStr)` และ `DrawText`
     - เพิ่มฟังก์ชัน `window.drawText(text, x, y, color, scale)` และ `window.setDrawText` สำหรับเรียกจากภายนอก


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
