# CLAUDE.md — แนวทางสำหรับ AI agent ที่ทำงานบน KidBright IDE

ก่อนเริ่มทุกครั้ง ให้อ่านไฟล์นี้ + `rule.md` (Vue/Vuetify/dialog conventions) + `Knowledge.md` (domain deep-dive) ประกอบกัน

---

## 1. Trace-first — ห้ามเดา ห้ามทำตามคำสั่งดิบ ๆ

อย่า apply pattern, directive, หรือ "fix" โดยการเดา ก่อนเขียนทุกครั้งให้ทำตามนี้:

1. **อ่านไฟล์เป้าหมายจนจบ** ไม่ใช่แค่บรรทัดที่จะแก้ — pattern / convention ที่ใช้ในไฟล์เดียวกันคือ source of truth ให้ match
2. **grep ทั้ง codebase หา pattern ที่กำลังจะเพิ่ม**
   - ไม่เจอเลย = ไม่มี precedent → สงสัยว่ามีเหตุผลก่อน
   - เจอหลายที่ = ใช้ shape เดิม อย่า fork คู่ขนาน
3. **Custom component ≠ framework primitive** — ก่อนใส่ directive (`v-tooltip`, ฯลฯ) บน custom component ให้เปิดไฟล์ component นั้น
   - ถ้าเป็น wrapper รอบ DOM element → directive อาจ forward หรือไม่ ขึ้นกับ implementation
   - ถ้า callsite อื่นในไฟล์เดียวกันใช้ wrapper component (เช่น `<VTooltip>` + `#activator` slot) ให้ตามนั้น
4. **Framework feature (directive, theme token, slot)** — ถ้าอ้างไม่ได้ว่ามีในเอกสาร / source ใช้ pattern ที่ verified แทน
5. **คำสั่ง user** — ถ้าคำสั่งนั้น trigger trap ข้างบน (เช่น "ใช้ v-tooltip directive" บน custom component) ให้ **push back พร้อม trace** ไม่ apply ทันที

> ค่าอ่านเพิ่ม ~10 วินาที vs ค่าเดาผิดคือ user ตรวจ + retry + อารมณ์เสีย → trace ก่อนเสมอ

---

## 2. Reference

- **`rule.md`** — Vue 3 `<script setup>`, `defineModel('isDialogVisible')` pattern, dialog placement (`src/components/dialog/`), Vuetify 3
- **`Knowledge.md`** — domain logic เชิงลึกของโปรเจค ตรวจก่อนวิเคราะห์ปัญหาที่น่าสงสัย
- **`README.md`** — architecture overview + dynamic module loading + AI training pipeline
