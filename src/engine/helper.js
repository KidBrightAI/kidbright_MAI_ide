export function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

export function randomId() {
  return Math.random().toString(36).substr(2, 9)
}


export function generatePascalVocFromDataset(data){
  let xmlobject = ""
  for(let annotation of data.annotate){
    xmlobject += `  <object>
    <name>${annotation.label}</name>
    <pose>Unspecified</pose>
    <truncated>0</truncated>
    <difficult>0</difficult>
    <bndbox>
      <xmin>${annotation.x1}</xmin>
      <ymin>${annotation.y1}</ymin>
      <xmax>${annotation.x2}</xmax>
      <ymax>${annotation.y2}</ymax>
    </bndbox>
  </object>\n`
  }
  
  return `<?xml version="1.0" encoding="utf-8"?>
  <annotation>
    <folder>Annotations</folder>
    <filename>${data.id}.${data.ext}</filename>
    <path>${data.id}.${data.ext}</path>
    <source>
      <database>Custom</database>
    </source>
    <size>
      <width>${data.width}</width>
      <height>${data.height}</height>
      <depth>3</depth>
    </size>
    <segmented>0</segmented>
  ${xmlobject}
  </annotation>`
}

// Constants from maixvision.js
export const HEADER = new Uint8Array([172, 190, 203, 202]) // 0xAC, 0xBE, 0xCB, 0xCA
export const VERSION = new Uint8Array([0])
export const Command = {
  Auth: 1,
  AuthAck: 2,
  Run: 3,
  RunAck: 4,
  Output: 5,
  Img: 6,
  Stop: 7,
  StopAck: 8,
  Finish: 9,
  Msg: 10,
  Heartbeat: 11,
  DeviceInfo: 12,
  DeviceInfoAck: 13,
  ImgFormat: 14,
  ImgFormatAck: 15,
  InstallApp: 16,
  InstallAppAck: 17,
  RunProject: 18,
  UpdateRuntime: 19,
  UpdateRuntimeAck: 20,
}

// Helper functions from maixvision.js, adapted for browser
export function packUint32(value) {
  const buffer = new ArrayBuffer(4)
  const view = new DataView(buffer)
  view.setUint32(0, value, true) // little-endian
  
  return new Uint8Array(buffer)
}

export function packMessage(cmd, data) {
  let dataBytes
  if (typeof data === 'string') {
    dataBytes = new TextEncoder().encode(data)
  } else if (data instanceof Uint8Array) {
    dataBytes = data
  } else {
    dataBytes = new Uint8Array([])
  }

  const frameData = new Uint8Array(VERSION.length + 1 + dataBytes.length)
  frameData.set(VERSION, 0)
  frameData.set(new Uint8Array([cmd]), VERSION.length)
  frameData.set(dataBytes, VERSION.length + 1)

  const message = new Uint8Array(HEADER.length + 4 + frameData.length)
  message.set(HEADER, 0)
  message.set(packUint32(frameData.length + 1), HEADER.length)
  message.set(frameData, HEADER.length + 4)

  const checksum = message.reduce((a, b) => a + b, 0) % 256
    
  const finalMessage = new Uint8Array(message.length + 1)
  finalMessage.set(message, 0)
  finalMessage.set(new Uint8Array([checksum]), message.length)

  return finalMessage
}

