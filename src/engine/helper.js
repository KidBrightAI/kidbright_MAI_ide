export function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
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
