<template>
  <div class="game-container">
    <iframe
      ref="gameInstance"
      width="100%"
      height="100%"
      scorlling="no"
      border="0"
      src="/src/static/KMV/index.html"
      frameborder="0"
      @load="onIframeLoaded"
    />
    <slot :instance="$refs" />
  </div>
</template>

<script>
import {registerPinCallback, setPinFromKMV} from "@/store/simulator.js"
export let logkmv = ""
export let imageBase64 = ""
export default {
  name: "KMVSimulator",
  data() {
    return {
      isIframeReady: false,
      messageHandler: null,
    }
  },
  mounted() {

    // บันทึก log ดูว่า mounted ทำงานเรียบร้อยแล้วหรือยัง
    console.log("KMV Simulator Component Mounted!")

    // ลงทะเบียนรับค่าจาก CodeToSim เมื่อ Python ส่งค่ามา
    registerPinCallback((pin, val) => {
      this.writePinToKMV(pin, val)
    })

    // ดักรับ SensorInput จาก iframe ผ่าน postMessage
    this.messageHandler = (event) => {
      if (event.data && (event.data.type === 'KMV_SENSOR_INPUT' || event.data.action === 'KMV_SENSOR_INPUT')) {
        const { pin, value } = event.data
        setPinFromKMV(pin, value)
      }
    }
    window.addEventListener('message', this.messageHandler)
  },

  beforeUnmount() {
    // คืนค่าและล้างทรัพยากรเมื่อ Component ถูกทำลาย
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler)
    }

    // Clear interval to prevent memory leaks
    //clearInterval(this.loopCheckLogKMV);
    registerPinCallback(null)
  },
  methods: {
    onIframeLoaded() {
      this.isIframeReady = true
      console.log("KMV Iframe Loaded Successfully.")
      const iframeWin = this.$refs.gameInstance?.contentWindow
      if (iframeWin && typeof iframeWin.setPinState === "function") {
        registerPinCallback((pin, val) => {
          this.writePinToKMV(pin, val)
        })

        // ส่งค่า Board (1=ซ้าย, 2=ขวา, เริ่มต้น 1) ไปยัง Iframe ทันทีที่โหลดเสร็จ
        let boardVal = "1"
        try {
          boardVal = localStorage.getItem("kmv_board_type") || sessionStorage.getItem("kmv_board_type") || "1"
        } catch (e) {}
        this.writePinToKMV("BOARD", boardVal)

        // ส่งสถานะ DISPLAY_CAMERA เริ่มต้น (0) ไปยัง Iframe
        this.writePinToKMV("DISPLAY_CAMERA", "0")

        // ส่งสถานะ DRAW_TEXT เริ่มต้น (0) ไปยัง Iframe
        this.writePinToKMV("DRAW_TEXT", "0")
      }
    },
    writePinToKMV(pin, val) {
      console.log(`[Vue Executing] Pin: ${pin}, Value: ${val}`)

      // ดึง Window Instance ของ Iframe
      const iframeWin = this.$refs.gameInstance?.contentWindow

      // ตรวจสอบความพร้อมของฟังก์ชันใน Iframe ก่อนส่งค่า
      if (iframeWin && typeof iframeWin.setPinState === "function") {
        iframeWin.setPinState(pin, val)
        // หากชื่อ Pin เป็นตัวเลขล้วน (เช่น "14") ให้ส่งในรูปแบบ "PH14" เพิ่มเติมด้วย เพื่อให้เข้ากับ Unity Script ทุกรูปแบบ
        if (/^\d+$/.test(String(pin))) {
          iframeWin.setPinState("PH" + pin, val)
        }
        // แมปปิ้งพินสำหรับ KidBright Micro AI Plus (A23..A15 <-> IO2..IO8)
        const aToIo = { 'A23': 'IO2', 'A27': 'IO3', 'A25': 'IO4', 'A22': 'IO5', 'A24': 'IO6', 'P24': 'IO7', 'A15': 'IO8', 'A17': 'IO9', 'A14': 'IO10' }
        const ioToA = { 'IO2': 'A23', 'IO3': 'A27', 'IO4': 'A25', 'IO5': 'A22', 'IO6': 'A24', 'IO7': 'P24', 'IO8': 'A15', 'IO9': 'A17', 'IO10': 'A14' }
        const strPin = String(pin).toUpperCase()
        if (aToIo[strPin]) {
          iframeWin.setPinState(aToIo[strPin], val)
        }
        if (ioToA[strPin]) {
          iframeWin.setPinState(ioToA[strPin], val)
        }
        if (pin === "DISPLAY_COLOR" || pin === "COLOR") {
          iframeWin.setPinState("DISPLAY_COLOR", val)
          iframeWin.setPinState("COLOR", val)
          if (typeof iframeWin.setDisplayColor === "function") {
            try { iframeWin.setDisplayColor(val) } catch (e) {}
          }
        }
        if (pin === "DISPLAY_CAMERA" || pin === "CAMERA") {
          iframeWin.setPinState("DISPLAY_CAMERA", val)
          iframeWin.setPinState("CAMERA", val)
          if (typeof iframeWin.setDisplayCamera === "function") {
            try { iframeWin.setDisplayCamera(val) } catch (e) {}
          }
        }
        if (pin === "DRAW_TEXT" || pin === "DISPLAY_DRAW_TEXT") {
          iframeWin.setPinState("DRAW_TEXT", val)
          if (typeof iframeWin.setDrawText === "function") {
            try { iframeWin.setDrawText(val) } catch (e) {}
          }
        }
        if (pin === "BOARD" || pin === "BOARD_VER" || pin === "BOARD_TYPE") {
          iframeWin.setPinState("BOARD", val)
          iframeWin.setPinState("BOARD_VER", val)
          if (typeof iframeWin.setBoard === "function") {
            try { iframeWin.setBoard(val) } catch (e) {}
          }
        }
      } else {
        console.warn("KMV iframe or 'setPinState' function is not ready yet.")
      }

      //if (this.$refs.gameInstance && this.$refs.gameInstance.contentWindow) {
      //this.$refs.gameInstance.contentWindow.setPinState(pin, val);
      //}

    },

    /*LoopCheckLogKMV() {
        //console.log("download: " + codeToSim);
        if(logkmv != this.$refs.gameInstance.contentWindow.Switch12()){
        

          logkmv = this.$refs.gameInstance.contentWindow.Switch12();
          ReceiveKMV("SW1, SW2: " + logkmv);

          console.log("SW1, SW2:" + logkmv);
          //this.InsertVKAE().catch((error) => console.error("InsertVKAE error:", error));
          //console.log("download: " + logkmv);//+ ", " + xx);
        }

        if(imageBase64 != this.$refs.gameInstance.contentWindow.ImageBase64()){
          imageBase64 = this.$refs.gameInstance.contentWindow.ImageBase64();
        }
      },*/
  },
}
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>