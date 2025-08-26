export function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}

export function randomId() {
  return Math.random().toString(36).substr(2, 9);
}

const moduleBuiltIn = [
  "framebuf", "ucryptolib", "urandom",
  "_boot", "gc", "uctypes", "ure",
  "_onewire", "inisetup", "uerrno",
  "_thread", "machine", "uhashlib", "uselect",
  "_webrepl", "math", "uhashlib", "usocket",
  "apa106", "micropython", "uheapq", "ussl",
  "btree", "uio", "ustruct",
  "builtins", "network", "ujson", "utime",
  "cmath", "ntptime", "umqtt/robust", "utimeq",
  "dht", "onewire", "umqtt/simple", "uwebsocket",
  "ds18x20", "sys", "uos", "uzlib",
  "esp", "uarray", "upip", "webrepl",
  "esp32", "ubinascii", "upip_utarfile", "webrepl_setup",
  "flashbdev", "ucollections", "upysh", "websocket_helper",
  "time", 
];

export function findIncludeModuleNameInCode(code){
  const regex = /^\s*?(?:import|from)\s+([^\s]+)/mg;

  let moduleList = [];
  let m;

  while ((m = regex.exec(code)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    let moduleName = m[1];
    if (moduleList.indexOf(moduleName) < 0) {
      moduleList.push(moduleName);
    }
  }
  moduleList = moduleList.filter((moduleName) => moduleBuiltIn.indexOf(moduleName) < 0);
  return moduleList;
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
  </object>\n`;
  }
  let xml = `<?xml version="1.0" encoding="utf-8"?>
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
  </annotation>`;
  return xml;
}

// Constants from maixvision.js
export const HEADER = new Uint8Array([172, 190, 203, 202]); // 0xAC, 0xBE, 0xCB, 0xCA
export const VERSION = new Uint8Array([0]);
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
};

// Helper functions from maixvision.js, adapted for browser
export function packUint32(value) {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, value, true); // little-endian
    return new Uint8Array(buffer);
}

export function packMessage(cmd, data) {
    let dataBytes;
    if (typeof data === 'string') {
        dataBytes = new TextEncoder().encode(data);
    } else if (data instanceof Uint8Array) {
        dataBytes = data;
    } else {
        dataBytes = new Uint8Array([]);
    }

    const frameData = new Uint8Array(VERSION.length + 1 + dataBytes.length);
    frameData.set(VERSION, 0);
    frameData.set(new Uint8Array([cmd]), VERSION.length);
    frameData.set(dataBytes, VERSION.length + 1);

    const message = new Uint8Array(HEADER.length + 4 + frameData.length);
    message.set(HEADER, 0);
    message.set(packUint32(frameData.length + 1), HEADER.length);
    message.set(frameData, HEADER.length + 4);

    const checksum = message.reduce((a, b) => a + b, 0) % 256;
    
    const finalMessage = new Uint8Array(message.length + 1);
    finalMessage.set(message, 0);
    finalMessage.set(new Uint8Array([checksum]), message.length);

    return finalMessage;
}

export function unpackMessage(message) {
    const data = new Uint8Array(message);

    const header = data.slice(0, 4);
    if (!header.every((value, index) => value === HEADER[index])) {
        console.error("message header error");
        return null;
    }

    const view = new DataView(data.buffer);
    const dataLen = view.getUint32(4, true); // little-endian

    if (data.length - 8 < dataLen) {
        console.error("message data frame not complete");
        return null;
    }

    const calculatedChecksum = data.slice(0, -1).reduce((acc, value) => acc + value, 0) % 256;
    if (calculatedChecksum !== data[dataLen + 7]) {
        console.error("check sum not equal");
        return null;
    }

    const cmd = data[9];
    const content = data.slice(10, 10 + dataLen - 3);
    return { cmd, content };
}
