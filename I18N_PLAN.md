# แผนระบบสองภาษา (i18n) สำหรับ KidBright mAI IDE

เอกสารนี้คือแผนและข้อตกลงของการทำให้ IDE มีสองภาษา ไทยและอังกฤษ สลับได้จากปุ่มเดียว แทนสภาพเดิมที่ข้อความสองภาษาปนกันทั่วทั้งแอป อ่านคู่กับ `CLAUDE.md` และ `rule.md` ทุกครั้งที่แตะข้อความที่ผู้ใช้มองเห็น

## สถานะล่าสุด

| เฟส | สถานะ | หมายเหตุ |
|---|---|---|
| 0 โครงสร้างพื้นฐาน | เสร็จ 2026-10-09 | commit 78e7b4c ทดสอบสลับภาษาใน browser แล้ว |
| 1 เปลือกหลักของ IDE | เสร็จ 2026-10-09 | commit e64844c Header, Footer, SidePanel, dialog ทุกตัว, pages, toast ใน store/engine/composables |
| 2 หน้า Capture / Annotate / Train | เสร็จ 2026-10-09 | commit e64844c รวม InputConnection, BoardImagePicker และกราฟเทรน |
| 3 Blockly | เสร็จ 2026-10-09 | commit e64844c toolbox, block ของ 2 บอร์ด, while_loop, plugin 9 ตัว รวม 377 ข้อความต่อภาษา คำแปลไทยของ block ควรให้ครูเจ้าของภาษาทบทวน (ดูหัวข้อท้ายเอกสาร) |
| 4 เนื้อหาและ metadata | เสร็จ 2026-10-09 | commit e64844c Instructions 13 ไฟล์, metadata ของบอร์ด/plugin/extension, node ใน designer, projectTypeTitle |
| 5 กันถอยหลัง | เสร็จ 2026-10-09 | `npm run i18n:check -- --strict` ผ่าน และ CI รันก่อน build, กฎข้อ 6 ใน rule.md |

ทุกเฟสเสร็จบน branch `feat/i18n-phase0` แล้ว รวมถึง merge งานแก้ไมค์ 1.2.5 (commit ffec9b1) ที่ commit "add KMV" บน main เคย revert ไป สิ่งที่ยังไม่ได้ทำในรอบนี้คือทดสอบหน้า designer ในขั้นเทรนบน browser (ต้องมีชุดข้อมูลก่อน) และการทบทวนคำแปลไทยของ block โดยครู อัปเดตตารางนี้ทุกครั้งที่ปิดเฟส พร้อมเลข commit หรือ tag ที่ปล่อย ทุกเฟสทำต่อกันบน branch `feat/i18n-phase0` และจะพิจารณา merge เข้า main เมื่อครบทุกเฟสแล้วเท่านั้น (ตัดสินใจ 2026-10-09)

## เป้าหมายและขอบเขต

- ผู้ใช้เลือกภาษาได้จาก Header ค่าที่เลือกจำไว้ข้ามการเปิดเว็บ
- ข้อความทุกชิ้นที่ผู้ใช้มองเห็นมีทั้งไทยและอังกฤษ ได้แก่ ปุ่ม ป้าย dialog toast คำอธิบายขั้นตอน ชื่อหมวดและข้อความบน block ของ Blockly ชื่อและคำอธิบายของบอร์ด plugin และ extension
- ไม่แปลสิ่งที่เป็นผลลัพธ์ของโปรแกรมผู้ใช้ เช่น `print("classifier loaded")` ที่ generator สร้าง, log ของสคริปต์บนบอร์ด, ชื่อไฟล์, ชื่อ label ใน dataset ที่ผู้ใช้ตั้งเอง
- ไม่แตะ `boards/*/js/maixvision.js` ซึ่งเป็น bundle ของบุคคลที่สาม

## สภาพก่อนเริ่ม (สำรวจ 2026-10-07 ที่ v1.2.5)

สิ่งที่มีอยู่แล้ว

- `vue-i18n` 9.2 และ `@intlify/vite-plugin-vue-i18n` อยู่ใน `package.json` และ `useI18n` อยู่ใน preset ของ unplugin-auto-import แต่ไม่มี `createI18n` ไม่มีไฟล์ locale และไม่ได้ `app.use` ที่ไหนเลย เป็นของที่ติดมากับ template Vuetify
- Blockly 10 จาก npm มี `blockly/msg/th` และ `Blockly.setLocale` พร้อมใช้
- Vuetify 3.4 มี locale `th` และ adapter `vuetify/locale/adapters/vue-i18n`
- ทุกหน้าใน `src/pages` ใช้ `layout: blank` ดังนั้นข้อความใน `src/layouts/components/*` ของ template เช่น Profile, Pricing, Logout เป็นโค้ดตาย ไม่ต้องแปล

ปริมาณข้อความโดยประมาณ

| ส่วน | ปริมาณ |
|---|---|
| string ไทยไม่ซ้ำใน script ของ src และ extensions | 127 |
| ข้อความไทยใน template | 93 |
| ข้อความอังกฤษใน template | 150 |
| string ใน attribute เช่น label, title, placeholder, text ของ tooltip | 53 |
| จุดเรียก toast ใน store, engine, composables, components | 70 |
| ข้อความ block ของ Blockly ใน 2 บอร์ด, `src/blocks` และ plugin ทุกตัว | 220 message, 80 appendField, 50 ชุด dropdown |
| Instructions ที่เป็นข้อความสอน | 13 ไฟล์ 407 บรรทัด |
| example readme | 4 ไฟล์ ภาษาไทย |

ข้อจำกัดเชิงโครงสร้างที่กำหนดแนวทาง

- ไฟล์ block ของบอร์ดและ plugin (`boards/*/blocks/*.js`, `plugins/*/blocks/*.js`) ถูก `fetch` ตอนรันแล้วเรียกผ่าน `new Function` ใน `src/engine/board.js` โดยส่ง `python`, `pythonGenerator`, `Blockly`, `workspaceStore` เข้าไป ไฟล์เหล่านี้ `import` อะไรไม่ได้ ช่องทางแปลจึงต้องผ่าน `Blockly.Msg`
- `boards/*/toolbox.js` เป็น ES module ที่ Vite bundle ให้ คืน array ของหมวดที่มี `name` และ XML ที่มี `<label text>` จึงเรียกฟังก์ชันแปลได้โดยตรง
- metadata หลายจุดเป็นข้อมูลไม่ใช่ template: `description` ของบอร์ดใน `boards/*/index.js`, `name` `description` `category` ของ plugin ใน `plugins/*/index.js`, `name` `title` และ `options.*.title` ของ extension ใน `extensions/*/config.js`, `title` ของ node ใน `src/nodes/**`
- `workspaceStore.projectTypeTitle` ถูก persist เป็นข้อความแสดงผลตอนสร้างโปรเจค ถ้าแปลตรง ๆ โปรเจคเก่าจะค้างภาษาเดิม ต้องคำนวณจาก id ของ extension ตอน render แทน
- `src/components/comfirm-dialog` มีค่า default ของปุ่มเป็น Cancel และ OK ฝังอยู่

## การออกแบบ

1. **vue-i18n แบบ composition API** (`legacy: false`, `globalInjection: true`) ข้อความกลางอยู่ที่ `src/locales/th/*.json` และ `src/locales/en/*.json` แยกไฟล์ตาม namespace ชั้นแรกและรวมอัตโนมัติด้วย Vite glob fallback เป็น `en` โมดูล JS ที่ไม่ใช่ component ใช้ `t` ที่ export จาก `src/plugins/i18n.js` ไม่ใช้ `<i18n>` block ใน SFC เพื่อให้สคริปต์ตรวจ key ทำงานกับไฟล์กลางอย่างเดียว
2. **ภาษาที่เลือกเก็บใน localStorage** key `kbmai.locale` เพราะต้องรู้ภาษาก่อน Pinia และก่อน Blockly ถูกตั้งค่า ค่าเริ่มต้นคือ `th` เมื่อ `navigator.language` ขึ้นต้นด้วย th ไม่งั้นเป็น `en`
3. **สลับภาษาแล้ว reload หน้า** เพราะ Blockly, toolbox และ block script ถูกสร้างตอนโหลด การสลับสดต้อง re-inject workspace ซึ่งยังไม่คุ้ม โปรเจคปัจจุบันถูก persist อยู่แล้วจึงไม่เสียงาน
4. **Blockly** เรียก `Blockly.setLocale(th หรือ en)` ตอนเริ่มเพื่อให้ block มาตรฐานและเมนูของ Blockly เป็นภาษาที่เลือก block ของเราเปลี่ยน `message0`, `tooltip` และ dropdown เป็น `%{BKY_KEY}` แล้วเก็บข้อความใน `locales/{th,en}.json` ของแต่ละบอร์ด plugin และ `src/blocks` ซึ่ง `main.js` รวมเข้า `Blockly.Msg` ก่อน `loadBoard` ใช้ JSON ไม่ใช่ `.js` เพราะ `package.json` ไม่ได้ประกาศ `type: module` สคริปต์ตรวจจึงอ่านได้ตรง ๆ
5. **Vuetify** ใช้ `createVueI18nAdapter` และใส่ข้อความ `$vuetify` จาก `vuetify/locale` ลงใน messages ให้ component มาตรฐานตามภาษาด้วย
6. **metadata รับได้ทั้ง string และ object `{ th, en }`** ผ่าน helper `localized()` string เดิมยังใช้ได้เพื่อไม่บังคับ plugin ของคนอื่น
7. **Instructions** ใช้ key ใน `src/locales` ร่วมกับ `<i18n-t>` สำหรับย่อหน้าที่มี span สี ส่วน example ใช้ `readme.md` คู่กับ `readme.en.md` แล้ว fallback เป็นไฟล์เดิม
8. **กันถอยหลัง** ด้วย `scripts/i18n-check.mjs` ที่ตรวจว่า key ครบทั้งสองภาษา ตรวจว่า `%{BKY_...}` ที่ block อ้างมีจริงในทั้งสองภาษา และรายงานอักษรไทยนอกไฟล์ locale ในเฟสท้ายเปิดโหมด strict ใน CI และเพิ่ม rule `no-raw-text` ของ `@intlify/eslint-plugin-vue-i18n` เฉพาะโค้ดใหม่ เพราะ lint ของ repo ยังไม่สะอาด

โครงไฟล์

```
src/plugins/i18n.js                 createI18n, getInitialLocale, setLocale, t, localized, SUPPORTED_LOCALES
src/locales/th/<namespace>.json     ข้อความกลางภาษาไทย ชื่อไฟล์คือ key ชั้นแรก เช่น header.json คือ header.*
src/locales/en/<namespace>.json     ข้อความกลางภาษาอังกฤษ โครงเดียวกัน
src/components/LanguageSwitcher.vue ปุ่มสลับภาษาใน Header
scripts/i18n-check.mjs              สคริปต์ตรวจ เรียกด้วย npm run i18n:check
boards/<id>/locales/{th,en}.json    เฟส 3 ข้อความ Blockly.Msg ของบอร์ด
plugins/<id>/locales/{th,en}.json   เฟส 3 ข้อความ Blockly.Msg ของ plugin
src/blocks/locales/{th,en}.json     เฟส 3 ข้อความ Blockly.Msg ของ block กลาง
```

## ข้อตกลงสำหรับนักพัฒนา

การเพิ่มข้อความใหม่

- ใน template ใช้ `{{ $t('header.saveProject') }}` หรือ `:text="$t('header.saveProject')"` ใน `<script setup>` ใช้ `const { t } = useI18n()` ซึ่ง auto-import ให้แล้ว
- ในโมดูล JS เช่น store, engine, composables ใช้ `import { t } from '@/plugins/i18n'`
- เพิ่ม key ลงทั้ง `src/locales/th/<namespace>.json` และ `src/locales/en/<namespace>.json` พร้อมกันเสมอ ห้ามใส่ภาษาเดียวแล้วค่อยตามทีหลัง ชื่อไฟล์ต้องตรงกับ namespace ชั้นแรกของ key
- ข้อความที่มีตัวแปรใช้ placeholder แบบ `{name}` เช่น `"อัปเดต {names} เรียบร้อย"` แล้วเรียก `t('board.scriptsUpdated', { names })`

การตั้งชื่อ key ใน `src/locales`

- แบ่งตามพื้นผิวของ UI เป็น namespace ชั้นแรก: `common`, `header`, `footer`, `sidePanel`, `dialog.<ชื่อ dialog>`, `page.<ชื่อหน้า>`, `capture`, `annotate`, `train`, `designer`, `board`, `project`, `plugin`, `wifi`, `file`, `voice`, `instructions.<extension>.<ขั้นตอน>`
- ชื่อ key เป็น camelCase สั้น ๆ บอกความหมายไม่ใช่บอกข้อความ เช่น `board.notConnected` ไม่ใช่ `board.pleaseConnectBoardFirst`
- namespace ใหญ่แยกเป็นหลายไฟล์ได้ด้วยชื่อ `<namespace>__<part>.json` เช่น `dialog__project.json` กับ `dialog__import.json` ซึ่ง loader รวมเป็น `dialog.*` ให้ และสคริปต์ตรวจจะฟ้องถ้า key ซ้ำกันระหว่างไฟล์
- key ทั่วไปอยู่ใน `common.json` เช่น `common.ok`, `common.cancel`, `common.connect` ใช้ซ้ำได้จากทุกที่ ถ้าคำนั้นมีความหมายเฉพาะในหน้าใดหน้าหนึ่ง ให้ตั้ง key ใน namespace ของหน้านั้นแทน
- `$vuetify` สงวนไว้ให้ Vuetify
- ข้อความของ Blockly ไม่อยู่ใน JSON แต่อยู่ใน `Blockly.Msg`

การตั้งชื่อ key ของ Blockly

- บอร์ด: `KB_<BOARD>_<BLOCK_TYPE ตัวใหญ่>` เช่น `KB_MAIPLUS_MAIX3_NN_CLASSIFY_LOAD` tooltip ต่อท้ายด้วย `_TOOLTIP` ตัวเลือก dropdown ต่อท้ายด้วย `_OPT_<ชื่อ>` ป้ายใน toolbox ใช้ `KB_<BOARD>_LABEL_<ชื่อ>`
- plugin: `KB_PLUGIN_<ID>_...` และ block กลางใน `src/blocks`: `KB_COMMON_...`
- ชื่อหมวดและป้ายใน toolbox ของบอร์ดไม่ได้อยู่ใน `Blockly.Msg` แต่อยู่ใน `src/locales/<code>/toolbox.json` เพราะ `boards/*/toolbox.js` ถูก bundle และเรียก `t()` ได้ตรง ๆ ส่วนชื่อหมวดของ plugin มาจาก `name` ใน `plugins/<id>/index.js` ซึ่ง `updateBlockCategory` อ่านผ่าน `localized()`
- ใน JSON ของ block อ้างด้วย `"message0": "%{BKY_KB_MAIPLUS_MAIX3_NN_CLASSIFY_LOAD}"` Blockly จะแทนค่าตอนสร้าง block และรองรับการสลับลำดับ `%1 %2` ในคำแปลไทย

metadata ของบอร์ด plugin และ extension

- field ที่แสดงผลให้เขียนเป็น `{ th: "...", en: "..." }` และอ่านผ่าน `localized(value)` ซึ่งคืนภาษาปัจจุบัน แล้ว fallback เป็น `en` แล้ว `th` ตามลำดับ string เดิมยังใช้ได้

glossary คำที่ต้องใช้ให้ตรงกันทุกที่

| English | ไทย | หมายเหตุ |
|---|---|---|
| Board | บอร์ด | |
| Connect / Disconnect | เชื่อมต่อ / ตัดการเชื่อมต่อ | |
| Upload / Download | อัปโหลด / ดาวน์โหลด | |
| Project | โปรเจค | สะกดตามที่ใช้ในโค้ดเดิม |
| Model | โมเดล | |
| Dataset | ชุดข้อมูล | |
| Label / Class | ป้ายกำกับ | ชื่อคลาสของการจำแนก |
| Capture | เก็บข้อมูล | ขั้นตอนที่ 1 |
| Annotate | กำกับข้อมูล | ขั้นตอนที่ 2 |
| Train | เทรน | ขั้นตอนที่ 3 |
| Coding | เขียนโค้ด | ขั้นตอนที่ 4 |
| Deploy | ติดตั้งลงบอร์ด | |
| Plugin / Extension | ปลั๊กอิน / ส่วนขยาย | |
| Simulator | ซิมูเลเตอร์ | KMV |
| Terminal | เทอร์มินัล | |
| Camera / Microphone | กล้อง / ไมโครโฟน | |
| Reboot the board | รีสตาร์ทบอร์ด | |
| Example | ตัวอย่าง | |
| Save / Open / Create / Delete | บันทึก / เปิด / สร้าง / ลบ | |

สิ่งที่ไม่ต้องแปล

- string ที่กลายเป็นโค้ด Python หรือ output ของโปรแกรมผู้ใช้
- log และข้อความใน `boards/*/scripts/*.py` และ `boards/*/libs/*.py`
- ค่าภายใน เช่น id, ชื่อไฟล์, ค่า field ของ block ที่ไม่ได้แสดงผล

## แผนเป็นเฟส

| เฟส | ขอบเขต | ขนาดโดยประมาณ | เวลา |
|---|---|---|---|
| 0 | plugin i18n, ไฟล์ locale, ปุ่มสลับภาษา, จำค่าและ reload, Vuetify adapter, Blockly setLocale, html lang, สคริปต์ตรวจ | โครงสร้าง | 1 วัน |
| 1 | Header, Footer, SidePanel, dialog ทั้งหมดใน `src/components/dialog`, `src/pages`, toast ใน store, engine, composables | 350 key | 2 ถึง 3 วัน |
| 2 | Capture, Annotate, Train ของ 3 extension และ `src/components/InputConnection`, `BoardImagePicker` | 100 key | 1 ถึง 2 วัน |
| 3 | toolbox และ block ของ 2 บอร์ด, `src/blocks`, plugin ทุกตัว พร้อม locale ของแต่ละชุด | 350 key ของ Blockly.Msg | 2 ถึง 3 วัน |
| 4 | Instructions 13 ไฟล์, example readme, metadata, `title` ของ node, แก้ `projectTypeTitle` | 150 key และเอกสาร | 1 ถึง 2 วัน |
| 5 | lint rule, เปิด strict ใน CI, เขียน convention ลง `rule.md` และ `CLAUDE.md` | กันถอยหลัง | ครึ่งวัน |

แต่ละเฟสปล่อยได้เอง หลังจบเฟส 2 เปลือกของ IDE จะเป็นสองภาษาสมบูรณ์โดย block ยังเป็นอังกฤษ ซึ่งเป็นจุดพักที่ยอมรับได้ งานหนักจริงคือการแปลประมาณ 800 ข้อความ

รายการตรวจของเฟส 0

- [x] `src/plugins/i18n.js` และ `app.use(i18n)` ใน `main.js`
- [x] `src/locales/th.json` และ `en.json` พร้อม key ชุดแรกที่ปุ่มสลับภาษาใช้
- [x] ปุ่มสลับภาษาใน Header ข้าง Version เลือกแล้วจำค่าและ reload
- [x] `Blockly.setLocale` ตามภาษาก่อน block ทุกชุดถูกนิยาม
- [x] Vuetify ใช้ `createVueI18nAdapter`
- [x] `document.documentElement.lang` ตามภาษา
- [x] `scripts/i18n-check.mjs` และ `npm run i18n:check`
- [x] build ผ่าน และทดสอบสลับภาษาใน browser แล้ว block มาตรฐานของ Blockly เปลี่ยนภาษา

บันทึกจากการทำเฟส 0

- ตัวเลือกภาษาในเมนูแสดงชื่อภาษาในตัวอักษรของภาษานั้นเอง (ไทย, English) และไม่ถูกแปล
- `blockly/msg/th` เป็น UMD ใช้ `import BlocklyMsgTh from 'blockly/msg/th'` แบบ default import แล้วส่งให้ `Blockly.setLocale` ได้ทั้งใน dev และ build
- การสลับภาษาทดสอบผ่าน `vite preview` ด้วย browser จริง: เลือกไทยแล้วหน้า reload, `html lang` เป็น th, block ใน Logic แสดง "ถ้า / ทำ / นอกเหนือจากนี้" และหัวเมนูเป็น "ภาษา"
- `npm run i18n:check` ในโหมดรายงานนับอักษรไทยนอก locale ได้ 354 บรรทัดใน 57 ไฟล์ ซึ่งคือปริมาณงานของเฟส 1 ถึง 4 รวมทั้งคอมเมนต์ภาษาไทยใน `src/store/simulator.js`
- block กลางใน `src/blocks` ส่วนใหญ่เป็นโค้ดตายจากยุค ESP32 เช่น RTC, DS18x20, deep sleep, dashboard ไม่ถูกอ้างถึงใน toolbox ใด และ `pin_*` ถูกนิยามทับโดย `blocks_pin.js` ของแต่ละบอร์ด เฟส 3 จึงแปลเฉพาะ `while_loop` ที่ตัวอย่างใช้ ที่เหลือควรพิจารณาลบทิ้งในภายหลัง

## คำถามที่รอตัดสินใจ

- ภาษาเริ่มต้นอิง browser ตามข้อ 2 ของการออกแบบ หรือบังคับไทยเสมอ
- ยอมรับการ reload ตอนสลับภาษาหรือไม่ ถ้าต้องการสลับสดต้องเพิ่มงาน re-inject Blockly และสร้าง toolbox ใหม่
- จะแปลข้อความบน block ด้วย หรือคง block เป็นอังกฤษทั้งสองภาษา ถ้าคงอังกฤษจะตัดเฟส 3 ทิ้งได้
- ใครเป็นคนแปล และมี glossary คำศัพท์สำหรับนักเรียนหรือไม่ เช่น Annotate, Train, Capture, Deploy

## ความเสี่ยงและวิธีรับมือ

- ข้อความแสดงผลที่ถูก persist ไว้ในโปรเจคเก่า เช่น `projectTypeTitle` แก้ด้วยการคำนวณจาก id ตอน render และคง fallback ให้ข้อมูลเก่า
- key `%{BKY_...}` ที่ขาดจะโชว์เป็นข้อความดิบบน block สคริปต์ตรวจต้องจับได้ก่อน merge
- plugin จากผู้พัฒนาภายนอกยังเป็น string เดี่ยว `localized()` ต้องรับ string ได้เสมอ
- block ภาษาไทยอาจต้องสลับลำดับ `%1 %2` ให้ถูกไวยากรณ์ ต้องรีวิวคำแปลบน workspace จริง ไม่ใช่ในไฟล์อย่างเดียว
- ขนาด bundle เพิ่มจากข้อความ Blockly สองภาษา ถ้ามีนัยสำคัญให้ import เฉพาะภาษาที่เลือกแบบ dynamic

## วิธีตรวจ

```bash
yarn install --frozen-lockfile          # ครั้งแรกบนเครื่องใหม่
npm run i18n:check                      # key ครบทั้งสองภาษา และรายงานอักษรไทยนอก locale
./node_modules/.bin/eslint -c .eslintrc.js --ext .js,.vue <ไฟล์ที่แก้>
NODE_OPTIONS=--max-old-space-size=4096 ./node_modules/.bin/vite build
```

lint ของ repo ยังมี error เดิมค้างอยู่หลายสิบรายการ ให้เทียบจำนวน error ของไฟล์ที่แก้กับเวอร์ชันใน HEAD แทนการคาดหวังว่าจะเป็นศูนย์

## ข้อสังเกตระหว่างทำ (ยังไม่ได้แก้ เพราะนอกขอบเขต i18n)

บั๊กและโค้ดตายที่เจอระหว่างไล่ไฟล์ทั้ง repo ควรเปิดเป็นงานแยก

- `boards/*/blocks/blocks_ai.js` block `maix3_nn_voice_get_result` ตัวเลือก class id สลับ label กับ value (`["class_id", "class id"]`) ต่างจาก block อื่น ทำให้เลือกแล้วได้ข้อความแทนเลขคลาส
- `src/components/InputConnection/ImageDatasetList.vue` อ้าง `props.value` ที่ไม่ได้ประกาศ และ `item.id == value` ที่ `value` ไม่มีอยู่ จะ ReferenceError ตอนลบในโหมดเลือกเดี่ยว
- `src/components/dialog/ImportObjectDetectDialog.vue` tab เริ่มต้นเป็น `"PASCAL VOL"` ที่ไม่ตรงกับค่าใด และ import แบบ KidBright AI น่าจะพังเพราะ VFileInput คืนไฟล์เดี่ยวไม่ใช่ array
- `src/pages/index.vue` เรียก `boardStore.upload()` โดยไม่มี try/catch ทำให้ toast อัปโหลดไม่สำเร็จไม่เคยขึ้นในโหมด Run และการเปิด dialog WiFi โดยไม่มีบอร์ดทำให้เกิด unhandled rejection
- `src/engine/protocols/web-adb.js` `rebootBoard()` ไม่ได้เรียก `SingletonShell.destroyInstance()` ต่างจาก disconnect
- โค้ดตาย: `src/components/InputConnection/SoundCapture.vue`, ไฟล์ขนาด 0 ไบต์ใน InputConnection และ `DeleteProjectDialog.vue`, block ส่วนใหญ่ใน `src/blocks` และ `blocks_pin.js`/`blocks_maix_v4.js` ของบอร์ดที่ไม่อยู่ใน toolbox, ตัวแปรและ import ที่ไม่ใช้ใน Header, Footer, SidePanel, NewProjectDialog และ Train.vue ทั้งสามชุดที่เป็นไฟล์เหมือนกันทุกไบต์
- ตัวอย่างใน `boards/*/examples` ทั้ง 4 ชุดเป็น placeholder (main.py คือ hello world และ readme เป็นข้อความชุดหุ่นยนต์) และปุ่มเปิดตัวอย่างใน Header ถูกคอมเมนต์ไว้ จึงยังไม่ได้เขียน readme ภาษาอังกฤษ แต่ `parseExamples` รองรับ `readme.en.md` แล้ว
- พิมพ์ผิดเดิมที่ตอนนี้แก้ได้ที่เดียวใน en.json ของบอร์ด: "tickness", "drawellipse" และชื่อ block `maix3_display_dislay`

## คำแปล block ที่ควรให้ครูทบทวน

agent ที่แปล block บันทึกคำที่ไม่แน่ใจไว้ เช่น threshold เป็น "เกณฑ์ความมั่นใจ", forever เป็น "ทำซ้ำตลอดไป", is tapped เป็น "บอร์ดถูกเคาะ", Buzzer beep tone/delay เป็น "บัซเซอร์ส่งเสียง … นาน …", Servo motor set pin/angle เป็น "หมุน servo ขา … ไปที่มุม …", get … เป็นวลีนาม "ผลการจำแนก …", publish/subscribe เป็น "ส่ง (publish)" / "สมัครรับ (subscribe)", การสะกด ดิจิทัล/แอนะล็อก ตามราชบัณฑิตยสภา และ class id ที่ยังคงเป็นอังกฤษ ทบทวนได้ที่ `boards/<id>/locales/th.json` และ `plugins/<id>/locales/th.json` โดยไม่ต้องแตะโค้ด
