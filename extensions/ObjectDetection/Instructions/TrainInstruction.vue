<template>
  <div class="hint">
    <div class="main-hint txt">
      <p class="p-color font-weight-bold">
        ขั้นตอนที่ 3 Training<br />(Object Detection)
      </p>
      <p>
        ขั้นตอนนี้เป็นการนำภาพที่ Annotate แล้วมาสร้างโมเดลรู้จำ โดยใช้
        Google Colab ในการสร้างโมเดล
        จึงจำเป็นต้องเชื่อมต่ออินเทอร์เน็ตให้เรียบร้อยก่อน
      </p>
      <p>
        <br />1. กดปุ่ม
        <span class="p-color">Create</span> เพื่อเรียกหน้า Colab
        จากนั้นทำการ login โดยใช้ Google Account ทำตามกระบวนการที่ปรากฏ
        เมื่อเสร็จสิ้นทำการคัดลอก URL
      </p>
      <p>
        <br />2. เลือกหน้าเว็บ KidBright AI และนำ URL
        ที่คัดลอกมาใส่ในกล่องข้อความสีเทา
      </p>
      <p>
        <br />3. กดปุ่ม
        <span class="p-color">Train</span> เพื่อส่งภาพไปสร้างโมเดลที่
        Colab รอจนกระบวนการสร้างโมเดลเสร็จสิ้น
      </p>
      <p>
        <br />4. กดปุ่ม
        <span class="p-color">Download</span> เพื่อนำโมเดลจาก Colab
        มาเก็บที่ KidBright AI
        เมื่อเสร็จขั้นตอนนี้โมเดลจะถูกเรียกใช้ได้ในขั้นตอนที่ 4 Coding
      </p>
    </div>
    <div class="mascot">
      <img src="@/assets/images/png/Mask_Group_11.png" alt="" srcset="" />
    </div>
  </div>
</template>
