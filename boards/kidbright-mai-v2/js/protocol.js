"use strict"

// การนำเข้าโมดูลที่จำเป็น (สมมติว่ามีการตั้งค่าไว้แล้ว)
const electron = require("electron")
const WebSocket = require("ws")
const log = require("electron-log")
const jimp = require("jimp")
const sharp = require("sharp")
const node_buffer = require("node:buffer")
const utils = require("@electron-toolkit/utils") // สำหรับ platform checking

const logger = log.scope("main-websocket")

// ตัวแปรสำหรับจัดการ WebSocket connection และการเชื่อมต่อ
let WS = null
let timeoutId = null

// --- 1. นิยามคำสั่งและโครงสร้างของโปรโตคอล ---

// Header ที่ใช้ในการตรวจสอบความถูกต้องของ Message
const HEADER = new Uint8Array([172, 190, 203, 202])

// เวอร์ชันของโปรโตคอล
const VERSION = new Uint8Array([0])

// Enum สำหรับประเภทของคำสั่งต่างๆ ที่ใช้สื่อสาร
var Command = /* @__PURE__ */ (Command2 => {
  Command2[Command2["Auth"] = 1] = "Auth"
  Command2[Command2["AuthAck"] = 2] = "AuthAck"
  Command2[Command2["Run"] = 3] = "Run"
  Command2[Command2["RunAck"] = 4] = "RunAck"
  Command2[Command2["Output"] = 5] = "Output"
  Command2[Command2["Img"] = 6] = "Img"
  Command2[Command2["Stop"] = 7] = "Stop"
  Command2[Command2["StopAck"] = 8] = "StopAck"
  Command2[Command2["Finish"] = 9] = "Finish"
  Command2[Command2["Msg"] = 10] = "Msg"
  Command2[Command2["Heartbeat"] = 11] = "Heartbeat"
  Command2[Command2["DeviceInfo"] = 12] = "DeviceInfo"
  Command2[Command2["DeviceInfoAck"] = 13] = "DeviceInfoAck"
  Command2[Command2["ImgFormat"] = 14] = "ImgFormat"
  Command2[Command2["ImgFormatAck"] = 15] = "ImgFormatAck"

  // ... คำสั่งอื่นๆ
  return Command2
})(Command || {})

/**
 * สร้าง Message frame สำหรับส่งผ่าน WebSocket
 * @param {Command} cmd - ประเภทของคำสั่ง
 * @param {string|Buffer|number} data - ข้อมูลที่จะส่ง
 * @returns {Uint8Array} - ข้อมูลที่พร้อมส่ง
 */
function packMessage(cmd, data) {
  if (typeof data === "string") {
    data = Buffer.from(data)
  }

  // ... (การแปลงข้อมูลประเภทอื่น)

  const frameData = new Uint8Array([...VERSION, cmd, ...data])
  const dataLength = packUint32(frameData.length + 1)
  const message = new Uint8Array([...HEADER, ...dataLength, ...frameData])
  const checksum = message.reduce((a, b) => a + b, 0) % 256

  return new Uint8Array([...message, checksum])
}

/**
 * แปลง Message frame ที่ได้รับกลับมาเป็นข้อมูลที่ใช้งานได้
 * @param {ArrayBuffer} message - ข้อมูลดิบที่ได้รับ
 * @returns {{cmd: Command, content: Uint8Array}|undefined}
 */
function unpackMessage(message) {
  const data = new Uint8Array(message)

  // 1. ตรวจสอบ Header
  if (!data.slice(0, 4).every((value, index) => value === HEADER[index])) {
    logger.error("message header error")
    
    return
  }

  // 2. ตรวจสอบ Checksum
  const dataLen = new DataView(data.buffer, 4, 4).getUint32(0, true)
  if (data.slice(0, -1).reduce((acc, value) => acc + value, 0) % 256 !== data[dataLen + 7]) {
    logger.error("check sum not equal")
    
    return
  }

  // 3. ดึง Command และ Content
  const cmd = data[9]
  const content = data.slice(10, 10 + dataLen - 3)

  return { cmd, content }
}

// ฟังก์ชันช่วยเหลือในการแปลงข้อมูล
function packUint32(value) {
  const buffer = new ArrayBuffer(4)
  const view = new DataView(buffer)
  view.setUint32(0, value, true)
  
  return Array.from(new Uint8Array(buffer))
}


// --- 2. การจัดการ Connection และ Event ---

/**
 * เริ่มการเชื่อมต่อ WebSocket ไปยังอุปกรณ์
 * @param {electron.IpcMainEvent} e - Event object จาก IPC
 * @param {string} ip - IP Address ของอุปกรณ์
 */
function connect(e, ip) {
  if (WS) return // ถ้ามีการเชื่อมต่ออยู่แล้วให้ออกจากฟังก์ชัน

  const win = electron.BrowserWindow.fromWebContents(e.sender)
  if (!win) return

  WS = new WebSocket(`ws://${ip}:7899`)
  WS.binaryType = "arraybuffer"

  // เมื่อเชื่อมต่อสำเร็จ
  WS.addEventListener("open", () => {
    const msg = packMessage(Command.Auth, "maixvision")
    WS?.send(msg)
    heartbeat(win) // เริ่มส่ง heartbeat
  })

  // เมื่อได้รับข้อมูล
  WS.addEventListener("message", event => {
    heartbeat(win) // รีเซ็ต timeout ของ heartbeat
    const res = unpackMessage(event.data)
    if (res) {
      handleCommand(win, res.cmd, res.content)
    }
  })

  // เมื่อการเชื่อมต่อถูกปิด
  WS.addEventListener("close", () => {
    win.webContents.send("device:connect-response", { code: 0, msg: "disconnected\n\n" })
    disconnect()
  })

  // เมื่อเกิดข้อผิดพลาด
  WS.addEventListener("error", error => {
    win.webContents.send("device:connect-response", {
      code: -1,
      msg: `connect device failed: ${error.message}\n`,
    })
    disconnect()
  })
}

/**
 * ยกเลิกการเชื่อมต่อ WebSocket
 */
function disconnect() {
  if (WS) {
    WS.removeAllListeners()
    if (WS.readyState === WebSocket.OPEN) {
      WS.close()
    }
    WS = null
  }
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

/**
 * จัดการ Heartbeat เพื่อรักษาการเชื่อมต่อ
 * หากไม่ได้รับข้อมูลใดๆ ใน 20 วินาที จะตัดการเชื่อมต่อ
 */
function heartbeat(win) {
  timeoutId && clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    win.webContents.send("device:connect-response", {
      code: 0,
      msg: "Device timeout. Close connection\n\n",
    })
    disconnect()
  }, 20000) // 20 วินาที
}


// --- 3. การจัดการคำสั่งที่ได้รับ (Message Handler) ---

/**
 * ตัวกลางในการเลือกฟังก์ชันที่จะทำงานตาม Command ที่ได้รับ
 * @param {electron.BrowserWindow} win - หน้าต่างของโปรแกรม
 * @param {Command} cmd - ประเภทของคำสั่ง
 * @param {Uint8Array} content - ข้อมูลที่ได้รับ
 */
function handleCommand(win, cmd, content) {
  switch (cmd) {
  case Command.AuthAck:
    const ok = auth(win, content)
    if (!ok) disconnect() // ถ้า Auth ไม่ผ่าน ให้ตัดการเชื่อมต่อ
    break
  case Command.RunAck:
    runAck(win, content)
    break
  case Command.Output:
    output(win, content)
    break
  case Command.Img:
    img(win, content)
    break
  case Command.StopAck:
    stopAck(win, content)
    break
  case Command.Finish:
    finish(win, content)
    break
  case Command.DeviceInfoAck:
    deviceInfo(win, content)
    break
  case Command.Heartbeat:
    WS?.send(packMessage(Command.Heartbeat, "")) // ตอบกลับ Heartbeat
    break

    // ... กรณีอื่นๆ
  default:
    logger.error("invalid command: ", cmd)
    break
  }
}

// ฟังก์ชันย่อยสำหรับจัดการแต่ละ Command
function auth(win, content) {
  const isSuccess = content[0] === 1
  const rsp = isSuccess
    ? { code: 1, msg: "connect successful\n\n" }
    : { code: -2, msg: `connect device failed: ${node_buffer.Buffer.from(content.slice(1)).toString()}\n\n` }
  win.webContents.send("device:connect-response", rsp)
  
  return isSuccess
}

function runAck(win, content) {
  const isSuccess = content[0] === 1
  const rsp = isSuccess ? { code: 0, msg: "start running...\n\n" } : {
    code: -1,
    msg: `device execute code failed: ${node_buffer.Buffer.from(content.slice(1)).toString()}\n\n`,
  }
  win.webContents.send("device:run-response", rsp)
}

function output(win, content) {
  const data = node_buffer.Buffer.from(content).toString()
  win.webContents.send("device:run-log", data)
}

function img(win, content) {
  // ใช้ Sharp หรือ Jimp ในการประมวลผลข้อมูลภาพที่ได้รับมา
  // แล้วส่งต่อไปยัง renderer process
  try {
    if (utils.platform.isLinux) {
      jimp.Jimp.read(node_buffer.Buffer.from(content.slice(1))).then(image => {
        const rsp = {
          data: image.bitmap.data.buffer,
          type: content[0] === 1 ? "jpeg" : "png",
          width: image.width,
          height: image.height,
        }
        win?.webContents.send("device:run-image", rsp)
      })
    } else {
      sharp(content.slice(1)).raw().ensureAlpha().toBuffer({ resolveWithObject: true }).then(({ data, info }) => {
        const rsp = {
          data: data.buffer,
          type: content[0] === 1 ? "jpeg" : "png",
          width: info.width,
          height: info.height,
        }
        win?.webContents.send("device:run-image", rsp)
      })
    }
  } catch (err) {
    logger.error("[Image Processing Exception]: ", err)
  }
}

function stopAck(win, content) {
  const isSuccess = content[0] === 1
  const rsp = isSuccess ? { code: 0, msg: "stop running success\n" } : {
    code: -1,
    msg: `stop running failed: ${node_buffer.Buffer.from(content.slice(1)).toString()}\n\n`,
  }
  win.webContents.send("device:stop-response", rsp)
}

function finish(win, content) {
  // ...
  win.webContents.send("device:run-finish", { code: 0, msg: "\nprogram exited\n\n" })
}

function deviceInfo(win, content) {
  win.webContents.send("device:information", node_buffer.Buffer.from(content).toString())
}


// --- 4. การส่งคำสั่งไปยังอุปกรณ์ ---

/**
 * ส่งโค้ดไปยังอุปกรณ์เพื่อรัน
 * @param {electron.IpcMainEvent} _ - (ไม่ใช้งาน)
 * @param {string} code - โค้ด Python ที่จะรัน
 */
function runCode(_, code) {
  const msg = packMessage(Command.Run, code)
  WS?.send(msg)
}

/**
 * สั่งให้อุปกรณ์หยุดทำงาน
 */
function stop() {
  const msg = packMessage(Command.Stop, "")
  WS?.send(msg)
}

/**
 * ตั้งค่ารูปแบบของภาพที่จะรับ (JPEG/PNG)
 * @param {electron.IpcMainEvent} e
 * @param {string} format - "jpeg" หรือ "png"
 */
function setImgFormat(e, format) {
  if (WS) {
    let command
    const img2 = format.toLowerCase()
    if (img2 === "jpeg") command = 1
    else if (img2 === "png") command = 2
    else command = 0 // ปิดการส่งภาพ

    const msg = packMessage(Command.ImgFormat, command)
    WS.send(msg)
  }
}


// --- 5. การลงทะเบียน Event Listeners สำหรับ IPC ---

// ส่วนนี้จะใช้ในการรับคำสั่งจาก Renderer Process (หน้า UI)
// เพื่อส่งต่อไปยังอุปกรณ์ผ่าน WebSocket
function registerWebSocketEvents() {
  electron.ipcMain.on("device:connect", connect)
  electron.ipcMain.on("device:disconnect", disconnect)
  electron.ipcMain.on("device:run", runCode)
  electron.ipcMain.on("device:stop", stop)
  electron.ipcMain.on("device:set-image-format", setImgFormat)
}

// เรียกใช้ฟังก์ชันนี้เมื่อแอปพลิเคชันพร้อมทำงาน
registerWebSocketEvents()