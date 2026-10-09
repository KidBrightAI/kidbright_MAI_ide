# แผน release 1.3.0 (เลื่อนไปปลายเดือนตุลาคม 2026)

**สถานะ:** เลื่อน release ตามที่ทีม NECTEC ขอให้รอถึงปลายเดือนตุลาคม 2026 แผนนี้บันทึกเมื่อ 2026-10-09 ขณะที่ main อยู่ที่ commit 36053fb และเว็บจริงยังเป็น v1.2.5

ห้าม bump เวอร์ชัน push tag หรือ deploy จนกว่าเจ้าของโปรเจคจะอนุมัติ ตามขั้นตอนใน `CLAUDE.md` ข้อ 2 และ `/deploy` เมื่อปล่อย 1.3.0 แล้วให้ลบไฟล์นี้และบรรทัดที่อ้างถึงใน `CLAUDE.md`

## ทำไมเป็น 1.3.0

เป็น MINOR เพราะมีฟีเจอร์ใหม่สองอย่าง คือบอร์ดจำลอง KMV และหน้าจอสองภาษาไทย/อังกฤษ ไม่มีอะไรที่ทำให้ของเดิมพัง ชนิดของ block ชื่อ field ค่าใน dropdown และ protocol ของบอร์ดไม่เปลี่ยน โปรเจคเดิมเปิดได้ตามเดิม โค้ดที่ IDE สร้างเปลี่ยนแค่การครอบ `int()` และการเพิ่ม import ซึ่งทำให้โปรแกรมที่เคยหยุดกลางทางทำงานต่อได้

## ต้องแก้ก่อน release

**KMV ใช้ไม่ได้บนเว็บจริง** iframe ใน `src/components/SimulatorController.vue` โหลด `/src/static/KMV/index.html` ซึ่งมีเฉพาะตอนรัน dev server เพราะ `npm run build` ไม่ได้คัดลอก `src/static` ไปไว้ใน `dist` บน production build หน้าต่าง KMV จะเปิดขึ้นมาแต่เป็นจอดำพร้อมข้อความ "Cannot GET" และบน Firebase จะได้หน้า IDE ซ้อนอยู่ข้างในแทน เพราะ Firebase rewrite ทุก path ที่ไม่มีไปที่ `index.html`

วิธีแก้คือเพิ่มการคัดลอกโฟลเดอร์ KMV ในสคริปต์ `copy` ของ `package.json` โดยไม่ต้องแตะไฟล์ของ NECTEC

```json
"copy": "copyfiles -V -u 1 \"boards/**/*\" dist/boards && copyfiles -V -u 1 \"plugins/**/*\" dist/plugins && copyfiles -V -u 1 \"extensions/**/*\" dist/extensions && copyfiles -V \"src/static/KMV/**/*\" dist"
```

ทดสอบแล้วเมื่อ 2026-10-09 ด้วยการคัดลอก `src/static/KMV` ไปไว้ที่ `dist/src/static/KMV` แล้วเปิดผ่าน `vite preview` บอร์ดจำลอง Unity โหลดขึ้น และการส่งค่า pin ระหว่าง IDE กับ KMV ทำงานปกติ ตอนลงมือจริงต้องรัน `npm run build` แล้วยืนยันว่ามี `dist/src/static/KMV/index.html` ก่อน commit ไฟล์ zip ในหน้า release จะใหญ่ขึ้นราว 38 MB

ควรแจ้งทีม NECTEC เรื่องนี้ด้วย ถ้าเขาย้ายตำแหน่งไฟล์ KMV หรือเปลี่ยน path ของ iframe ก่อน release ต้องปรับสคริปต์ `copy` ให้ตรงกัน

## ต้องตัดสินใจร่วมกับ NECTEC ก่อน release

- **การเรียกบริการภายนอกเพื่อดู IP** `src/pages/index.vue` เรียก `https://api.ipify.org` ทุกครั้งที่เปิด IDE ค่า IP ที่ได้ไม่ได้ถูกใช้หรือส่งไปที่ใดในโค้ดตอนนี้ เป็นเว็บที่นักเรียนใช้ การส่ง IP ของเครื่องนักเรียนให้บริการภายนอกโดยไม่จำเป็นจึงไม่ควรมี
- **อีเมลจริงของบุคคลฝังอยู่ในโค้ด** `AE/AEsession.js` ใช้อีเมลจริงของบุคคลเป็นค่าเริ่มต้นของ session และ `src/pages/index.vue` พิมพ์ค่านี้ลง console ทุกครั้งที่เปิด IDE อีเมลจะติดไปใน JavaScript ของเว็บจริงที่ใครก็เปิดดูได้
- **ข้อเสนอ:** ลบการเรียก ipify เปลี่ยนอีเมลเป็นค่าว่าง และลบบรรทัด `console.log` นั้นก่อน release ถ้าตกลงทำ ให้เพิ่มหนึ่งบรรทัดในหมวด **Changed** ของ README

## ตรวจก่อน push tag

- ดู commit ใหม่ทั้งหมดอีกรอบด้วย `git log v1.2.5..HEAD --oneline` เพราะ NECTEC อาจ push เพิ่มก่อนปลายเดือน แล้วปรับร่าง README ให้ครบ
- `npm run i18n:check -- --strict` ต้องผ่าน CI รันคำสั่งเดียวกันก่อน build และจะหยุด release ทันทีถ้ามีข้อความไทยนอกไฟล์ locale หรือ key ขาดภาษาใดภาษาหนึ่ง โค้ดใหม่ของ NECTEC ต้องเพิ่มข้อความผ่าน `src/locales` ตาม `rule.md` ข้อ 6
- `npm ci --dry-run` ในโฟลเดอร์ชั่วคราวที่มีแค่ `package.json` กับ `package-lock.json` ต้องผ่าน commit KMV เปลี่ยน lockfile เป็น version 1 ซึ่งยังผ่านเมื่อ 2026-10-09
- build แล้วเปิดด้วย `vite preview` กดปุ่ม KMV ต้องเห็นบอร์ดจำลอง
- ถ้ามีบอร์ด uAI Plus ให้ทดสอบ block ในหมวดรูปภาพทั้ง 12 ตัวด้วยค่าทศนิยมบนบอร์ดจริง รอบก่อนตรวจได้เฉพาะ block วาดข้อความบนบอร์ด ส่วนตัวอื่นตรวจกับโมดูลจำลองตามเอกสาร MaixPy

## commit ที่จะรวมใน release (ณ 2026-10-09)

```
36053fb fix(mai-plus): image blocks accept float positions and sizes, draw text imports maix image
dc5ebb1 merge: Thai/English UI, restored 1.2.5 voice fix, footer board label, draw text fix
eb1c221 fix(mai-plus): draw text no longer stops the program on float positions
8d5e00a fix(footer): group the board name with undo/redo and the terminal toggle
f87bc6e chore(i18n): phase 5, strict translation check in CI and the rule for new strings
ffec9b1 merge: restore the 1.2.5 voice-recorder fix into the i18n branch
e64844c feat(i18n): phases 1-4, every UI string in Thai and English
78e7b4c feat(i18n): phase 0 infrastructure, Thai/English switch in the header
10bbeb6 fix(v2-voice): recorder waits for capabilities, evicts mic holders, reports failures
bae962c docs: add I18N_PLAN.md, the Thai/English i18n plan and developer conventions
ae41162 add KMV
```

## ขั้นตอนเมื่อได้รับอนุมัติ

1. แก้สคริปต์ `copy` ให้รวม KMV และแก้เรื่อง ipify กับอีเมลถ้าตกลงทำ รัน build ยืนยันว่า `dist` มี KMV แล้ว commit และ push
2. เปลี่ยน `version` ใน `package.json` เป็น `1.3.0` เปลี่ยนบรรทัด `Current release` และเพิ่ม block ด้านล่างไว้บนสุดของหัวข้อ `## Version` ใน `README.md` แล้ว commit ด้วยข้อความ `chore(release): 1.3.0 — <theme>` และ push
3. สร้าง tag `v1.3.0` แล้ว push ซึ่งจะสั่ง `.github/workflows/release.yml` ให้ตรวจคำแปล build deploy ไปที่ Firebase และสร้าง GitHub release
4. เฝ้า workflow จนจบด้วย `gh run watch` แล้วเปิด https://kidbright-mai.web.app ตรวจว่าแถบด้านบนขึ้น 1.3.0 และกดปุ่ม KMV แล้วบอร์ดจำลองโหลดได้

URL ที่จะเปลี่ยนคือ https://kidbright-mai.web.app และ https://github.com/KidBrightAI/kidbright_MAI_ide/releases/tag/v1.3.0

## ร่าง README 1.3.0

```markdown
### 1.3.0 — บอร์ดจำลอง KMV, หน้าจอสองภาษาไทย/อังกฤษ และ block วาดภาพที่ไม่หยุดเมื่อได้ค่าทศนิยม

**Added**
- **บอร์ดจำลอง KMV จากทีม NECTEC** ปุ่ม KMV บนแถบด้านบนเปิดหน้าต่างบอร์ด KidBright จำลอง โปรแกรม Blockly รันในเบราว์เซอร์ด้วย Python บน WebAssembly แล้วแสดงผลกับไฟ จอแสดงผล buzzer มอเตอร์ เซอร์โว และเซนเซอร์บนบอร์ดจำลอง พร้อมไฮไลต์ block ที่กำลังทำงาน สลับเต็มจอหรือแบ่งจอได้ ใช้ทดลองโปรแกรมได้โดยไม่ต้องมีบอร์ดจริง ต้องต่ออินเทอร์เน็ตเพราะโหลดตัวรัน Python จาก CDN
- **หน้าจอ IDE ภาษาไทยและอังกฤษ** ปุ่มเลือกภาษาอยู่ข้างเลขเวอร์ชันบนแถบด้านบน ครอบคลุมเมนู dialog ข้อความแจ้งเตือน คำแนะนำแต่ละขั้น หน้าออกแบบโมเดล และข้อความบน block ของทั้งสองบอร์ดและปลั๊กอินทุกตัว ครั้งแรกเลือกตามภาษาของเบราว์เซอร์และจำค่าที่เลือกไว้ การสลับภาษาจะโหลดหน้าใหม่โดยโปรเจคที่เปิดอยู่ไม่หาย

**Fixed**
- **block วาดภาพบน mAI Plus ทำให้โปรแกรมหยุดเมื่อได้ค่าทศนิยม** maix.image รับพิกัด ขนาด และความหนาเป็นจำนวนเต็มเท่านั้น แต่การหารใน block ได้ทศนิยมเสมอ เช่น การหาจุดกึ่งกลางของวัตถุที่ตรวจจับได้ โปรแกรมจึงหยุดด้วย TypeError ทันทีที่ block ทำงาน ตอนนี้ block วาดข้อความทั้งสองแบบ เส้น สี่เหลี่ยม วงกลม วงรี กากบาท ลูกศร วางภาพ crop resize สร้างภาพใหม่ และสร้างภาพจาก bytes ปัดค่าเป็นจำนวนเต็มให้เอง
- **block วาดข้อความในหมวดรูปภาพทำให้โปรแกรมหยุดด้วย NameError** เมื่อภาพมาจากกล้องโดยตรง เพราะ block ไม่ได้ import โมดูล image ของ maix ทั้งที่ใช้กำหนดสี
- **ชื่อบอร์ดที่มุมล่างซ้ายบังหมวดสุดท้ายของ toolbox** ย้ายไปอยู่มุมล่างขวาร่วมกับปุ่ม undo/redo และเทอร์มินัล

**Changed**
- ไฟล์ zip ในหน้า release ใหญ่ขึ้นราว 38 MB เพราะรวมไฟล์ของ KMV
- CI ตรวจว่าข้อความทุกชิ้นมีครบทั้งสองภาษาก่อน build

  ตรวจสอบ: block วาดข้อความทดสอบบนบอร์ด uAI Plus จริง โค้ดจากเวอร์ชันก่อนหยุดด้วย TypeError ส่วนเวอร์ชันนี้รันจนจบ · block วาดอื่นตรวจด้วยโค้ดที่ IDE สร้างจริง รันกับโมดูลจำลองที่บังคับชนิดตามเอกสาร MaixPy · KMV เปิดและโหลดบอร์ดจำลองได้บน production build · สลับภาษาทดสอบใน browser ทั้งสองภาษา
```
