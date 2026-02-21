# คู่มืออธิบายการใช้งาน Vue 3 `defineModel`

เอกสารนี้อธิบายการใช้งานและแนวทางปฏิบัติที่ดีที่สุดสำหรับ `defineModel` ในโปรเจค Vue 3

## 1. จุดประสงค์ของ `defineModel`

มาโคร `defineModel` มีไว้ใช้ใน `<script setup>` เพื่อลดรูป (boilerplate) ในการทำ Two-way Binding (v-model) แบบเดิมที่จะต้อง:
1. ประกาศ `props` สำหรับค่าที่ส่งเข้ามา
2. ประกาศ `emit` (เช่น `update:modelValue`) สำหรับการแจ้งเตือน parent เมื่อค่าเปลี่ยน
3. ดูแลการ Sync ค่าไปมาทั้งสองทาง

ด้วย `defineModel` เราจะได้ `Ref` กลับมาเพียงตัวเดียว ซึ่งสามารถอ่านค่าและแก้ไขค่าได้เลย โดยกรอบการทำงานของ Vue จะจัดการส่ง emit กลับไปให้ parent ให้อัตโนมัติ

---

## 2. Default `v-model` (แบบปกติ)

เป็นกรณีที่มีการ binding ตัวแปรแบบตัวเดียวเป็นค่าเริ่มต้น

**Parent Component:**
```vue
<ChildComponent v-model="isVisible" />
```

**Child Component (ChildComponent.vue):**
```vue
<script setup>
// จะได้ props ชื่อ modelValue และ emit ชื่อ update:modelValue อัตโนมัติ
const isVisible = defineModel()

const closeDialog = () => {
  // เมื่อกำหนดค่าใหม่ Vue จะส่ง emit ให้ Parent รับไปอัปเดตอัตโนมัติ
  isVisible.value = false
}
</script>

<template>
  <VDialog v-model="isVisible" />
</template>
```

---

## 3. Named `v-model` (แบบระบุชื่อโมเดล)

เป็นกรณีที่ Parent ต้องการระบุชื่อชัดเจน เพื่อความอ่านง่าย (Readable) หรือจัดการฟอร์มที่มีหลาย Model

**Parent Component:**
```vue
<ChildComponent v-model:title="bookTitle" v-model:author="bookAuthor" />
<!-- กรณี Dialogs: -->
<MyDialog v-model:isDialogVisible="openDialog" />
```

**Child Component (ChildComponent.vue):**
```vue
<script setup>
// ต้องระบุ argument เป็น string ให้ตรงกับชื่อที่ Parent ส่งมา!!
const title = defineModel('title')
const author = defineModel('author')

// กรณี Dialogs ในโปรเจคปัจจุบัน:
// ระบุ options เพิ่มเติม (เช่น type หรือ default) ผ่าน argument ที่สอง
const isDialogVisible = defineModel('isDialogVisible', { type: Boolean, default: false })

const closeBox = () => {
    isDialogVisible.value = false // จะ emit กลับไปหา parent ชื่อ update:isDialogVisible ทันที
}
</script>

<template>
  <VDialog v-model="isDialogVisible" />
</template>
```

---

## 4. ปัญหาที่พบบ่อย (Common Pitfalls)

### 🚨 ปัญหา: ชื่อฝั่ง Child กับ Parent ไม่ตรงกัน (Mismatch)
ถ้า Parent ส่ง `v-model:isDialogVisible="dialogState"`
แต่ฝั่ง Child ประกาศ `const isDialogVisible = defineModel()` (ไม่มี argument String ระบุชื่อในวงเล็บ)

**ผลลัพธ์:** Child จะไปมองหา prop ที่ชื่อ `modelValue` แทน ทำให้ Dialog เปิดไม่ขึ้นหรือค่าไม่ถูกส่งกลับ 

*การแก้ไข:* ฝั่ง Child ต้องเขียนให้ตรงชื่อที่รับมา: 
`const isDialogVisible = defineModel('isDialogVisible')`

### 🚨 ปัญหา: เรียก Emit ซ้ำซ้อน 
การใช้ `defineModel` แล้ว ห้ามเขียน `emit('update:isDialogVisible')` หรือ `emit('update:modelValue')` คู่กันอีก (อย่างที่เคยพบในโค้ดเก่า) เพราะถือเป็นการซ้ำซ้อน ให้อัปเดตข้อมูลผ่าน `.value` โดยตรงเท่านั้น
