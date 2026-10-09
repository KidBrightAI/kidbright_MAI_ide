# KidBright IDE Project Rules

กฏและแนวทางการเขียนโค้ดสำหรับโปรเจค KidBright IDE เพื่อเป็นมาตรฐานเดียวกัน

## 1. Vue 3 Composition API & `<script setup>`
- ใช้ Vue 3 Composition API และ `<script setup>` เป็นหลัก 
- หลีกเลี่ยงการใช้ Options API (`data(), methods: {}, computed: {}` ฝั่งเก่า) ในคอมโพเนนต์ใหม่

## 2. การจัดการ Dialog และ Two-Way Binding (v-model)
เมื่อสร้างหรือ Component ใดๆ ที่หน้าตาเป็น Popup / Dialog ที่ต้องมีการเปิดและปิด ให้ยึดหลักดังนี้:

**2.1 ใช้ `defineModel` เสมอ**
- ให้ยุติการใช้แพทเทิร์นเก่า (`props: ['modelValue']` และ `emit('update:modelValue')`)
- ให้ใช้ `defineModel` ของ Vue 3.4+ สำหรับทำ Two-Way Binding ที่เกี่ยวกับ Visibility 

**2.2 การตั้งชื่อ Model (Named Model)**
เพื่อให้เห็นภาพชัดเจนจาก Parent ว่า `v-model` ตัวนี้ทำหน้าที่อะไร:
✅ **บังคับใช้ชื่อ**: `isDialogVisible` สำหรับกำหนด State การเปิดปิด Dialog เสมอ
✅ **ฝั่ง Parent**: ให้เรียกใช้งานผ่าน Named Model:
   ```vue
   <MyDialog v-model:isDialogVisible="dialogState" />
   ```
✅ **ฝั่ง Child (ไฟล์ Dialog)**: ต้องประกาศรับชื่อที่ตรงกัน และควรระบุ Option ไว้เพิ่อความปลอดภัย:
   ```vue
   <script setup>
   const isDialogVisible = defineModel('isDialogVisible', { type: Boolean, default: false })
   
   const closeDialog = () => {
     isDialogVisible.value = false // ใช้ .value เพื่ออัปเดตและส่ง emit คืน Parent อัตโนมัติ
   }
   </script>
   ```

**2.3 ข้อห้าม (Anti-Patterns) ของ defineModel**
- ❌ **ห้าม** เรียกใช้ `emit('update:isDialogVisible')` ซ้ำซ้อน หากมีการใช้ `defineModel` ไปแล้ว 
- ❌ **ห้าม** ประกาศ `const isDialogVisible = defineModel()` ลอยๆ โดยไม่มี argument `('isDialogVisible')` หากฝั่ง Parent ใช้งานแบบ Named Model (`v-model:isDialogVisible`) เพราะจะเกิด Mismatch และ Binding ไม่ทำงาน
- ❌ กรณี Dialog มีสถานะภายในเยอะๆ ห้ามพยายามผูกแบบ `v-model` กลับไปที่ Parent ทุกค่า (Multiple v-model) ให้แยก State ที่ใช้งานเฉพาะใน Dialog ไว้ที่ Child Component และใช้ `emit('submit', payload)` หรือ `emit('value', val)` กลับไปเมื่อทำงานเสร็จ

## 3. Tooling & Libraries
- ใช้ `Vuetify 3` เป็น UI Framework หลัก (อ้างอิงจาก `<VDialog>`, `<VBtn>`, เป็นต้น)
- โปรเจคนี้ใช้ `vite-plugin-pages` สำหรับทำ Auto-routing ไฟล์ที่อยู่ใน `src/pages/` จะกลายเป็น Route โดยอัตโนมัติตามโครงสร้างโฟลเดอร์

## 4. โครงสร้างและการจัดระเบียบไฟล์
- **Dialog Components**: ให้อยู่ภายใต้ `src/components/dialog/` เท่านั้น เพื่อความเป็นระเบียบ
- **View / Pages**: ให้อยู่ภายใต้ `src/pages/` (แต่ละไฟล์จะผูกกับระบบ Router ดึงไปใช้เป็นหน้าเว็บ)

## 5. การใช้ความรู้จาก Knowledge Base
ทุกครั้งที่พบปัญหาที่น่าสงสัย หรือต้องการอ้างอิงลอจิกการทำงานเชิงลึกของโปรเจค ให้ตรวจสอบและดูที่ไฟล์ **Knowledge.md** ประกอบการวิเคราะห์เสมอ

## 6. ข้อความที่ผู้ใช้มองเห็นต้องผ่านระบบสองภาษา
- ห้ามเขียนข้อความไทยหรืออังกฤษที่ผู้ใช้มองเห็นลงใน template, toast, dialog, block หรือ metadata ตรง ๆ ให้ใส่ key ใน `src/locales/th/*.json` และ `src/locales/en/*.json` พร้อมกันทั้งสองภาษา แล้วเรียกผ่าน `$t('ns.key')` ใน template, `useI18n()` ใน `<script setup>` หรือ `import { t } from '@/plugins/i18n'` ในโมดูล JS
- ข้อความบน block ของ Blockly อยู่ใน `boards/<id>/locales/{th,en}.json`, `plugins/<id>/locales/{th,en}.json` หรือ `src/blocks/locales/{th,en}.json` และอ้างด้วย `%{BKY_KB_...}`
- metadata ของบอร์ด plugin และ extension ที่แสดงผล เช่น `description`, `title` เขียนเป็น `{ th, en }` แล้วอ่านผ่าน `localized()`
- รัน `npm run i18n:check -- --strict` ก่อน commit ทุกครั้ง CI รันคำสั่งเดียวกันก่อน build และจะล้มถ้ามี key ขาด key ซ้ำ reference ของ Blockly ที่ไม่มีคำแปล หรือข้อความไทยนอกไฟล์ locale
- รายละเอียดการตั้งชื่อ key, glossary และสถานะแต่ละเฟสอยู่ใน **I18N_PLAN.md**
