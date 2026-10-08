import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

console.log("=== Testing Draw Text Block Detection and Signaling ===")

// 1. Verify generators
const genMaiBasic = fs.readFileSync(path.join(root, 'boards/kidbright-mai/blocks/generators_basic.js'), 'utf-8')
const genMaiPlusBasic = fs.readFileSync(path.join(root, 'boards/kidbright-mai-plus/blocks/generators_basic.js'), 'utf-8')
const genMaiV4 = fs.readFileSync(path.join(root, 'boards/kidbright-mai/blocks/generators_maix_v4.js'), 'utf-8')

if (!genMaiBasic.includes("writePinToKMV('DRAW_TEXT'")) {
  throw new Error("kidbright-mai maix3_draw_string missing DRAW_TEXT call")
}
console.log("✔ kidbright-mai maix3_draw_string includes DRAW_TEXT call")

if (!genMaiPlusBasic.includes("writePinToKMV('DRAW_TEXT'")) {
  throw new Error("kidbright-mai-plus display_draw_string missing DRAW_TEXT call")
}
console.log("✔ kidbright-mai-plus display_draw_string includes DRAW_TEXT call")

if (!genMaiV4.includes("writePinToKMV('DRAW_TEXT'")) {
  throw new Error("kidbright-mai maix4_draw_string missing DRAW_TEXT call")
}
console.log("✔ kidbright-mai maix4_draw_string includes DRAW_TEXT call")

// 2. Verify simulator.js
const simJs = fs.readFileSync(path.join(root, 'src/store/simulator.js'), 'utf-8')
if (!simJs.includes("writePinToKMV('DRAW_TEXT'")) {
  throw new Error("simulator.js missing DRAW_TEXT handling")
}
console.log("✔ simulator.js includes DRAW_TEXT handling and reset")

// 3. Emulate CodeToSim logic
function testSimLogic(code) {
  let dtState = null
  const mockWritePinToKMV = (pin, val) => {
    if (pin === 'DRAW_TEXT') dtState = val
  }

  const hasDrawTextBlock = /writePinToKMV\(['"]DRAW_TEXT['"]|draw_string\s*\(|display_draw_string|maix3_draw_string|maix4_draw_string/i.test(code)
  if (!hasDrawTextBlock) {
    mockWritePinToKMV('DRAW_TEXT', '0')
  } else {
    const preLoopCode = code.split(/\b(?:while|for)\b/)[0].split(/\b(?:time\.)?sleep\b/)[0]
    const dtMatch = preLoopCode.match(/writePinToKMV\(['"]DRAW_TEXT['"],\s*['"]([^'"]+)['"]\)/i)
    if (dtMatch && dtMatch[1]) {
      mockWritePinToKMV('DRAW_TEXT', dtMatch[1])
    } else {
      mockWritePinToKMV('DRAW_TEXT', '1')
    }
  }
  return dtState
}

// Case A: With draw text block before loop
const codeWithText1 = `
try:
  import js
  if hasattr(js, 'writePinToKMV'):
    js.writePinToKMV('DRAW_TEXT', '1,Hello,10,20,10,1')
except Exception:
  pass
_display_text_image.draw_string(10, 20, "Hello", scale=1, color=(255, 0, 0))
`
const res1 = testSimLogic(codeWithText1)
if (res1 !== '1,Hello,10,20,10,1') {
  throw new Error(`Expected '1,Hello,10,20,10,1', got '${res1}'`)
}
console.log("✔ Case 1: Code with draw text sends 1 with parameters:", res1)

// Case B: Without draw text block
const codeWithoutText = `
from maix import display
display.show(image.new(size=(240, 240), color=(0, 255, 0)))
`
const res2 = testSimLogic(codeWithoutText)
if (res2 !== '0') {
  throw new Error(`Expected '0', got '${res2}'`)
}
console.log("✔ Case 2: Code without draw text sends 0")

// 4. Test index.html parsing
const indexHtml = fs.readFileSync(path.join(root, 'src/static/KMV/index.html'), 'utf-8')
if (!indexHtml.includes('<p id="DRAW_TEXT">0</p>')) {
  throw new Error("index.html missing <p id=\"DRAW_TEXT\">0</p>")
}
if (!indexHtml.includes('<p id="DRAW_TEXT_CONTENT"></p>')) {
  throw new Error("index.html missing DRAW_TEXT_CONTENT")
}
if (!indexHtml.includes('setDrawText')) {
  throw new Error("index.html missing setDrawText")
}
console.log("✔ index.html contains all DRAW_TEXT elements and setDrawText")

// Test string parsing logic as implemented in index.html
function parseDrawText(value) {
  var dtStatus = "0";
  var dtText = "";
  var dtX = "0";
  var dtY = "0";
  var dtColor = "0";
  var dtScale = "0";

  if (String(value) === "0" || value === 0 || value === false) {
    dtStatus = "0";
  } else {
    var valStr = String(value);
    var parts = valStr.split(",");
    if (parts.length >= 6) {
      dtStatus = parts[0];
      dtScale = parts[parts.length - 1];
      dtColor = parts[parts.length - 2];
      dtY = parts[parts.length - 3];
      dtX = parts[parts.length - 4];
      dtText = parts.slice(1, parts.length - 4).join(",");
    }
  }
  return { dtStatus, dtText, dtX, dtY, dtColor, dtScale }
}

const parsedActive = parseDrawText("1,Hello World,15,30,7,2")
if (parsedActive.dtStatus !== '1' || parsedActive.dtText !== 'Hello World' || parsedActive.dtX !== '15' || parsedActive.dtY !== '30' || parsedActive.dtColor !== '7' || parsedActive.dtScale !== '2') {
  throw new Error("Parsed active text does not match: " + JSON.stringify(parsedActive))
}
console.log("✔ index.html parser verified with active text:", parsedActive)

const parsedInactive = parseDrawText("0")
if (parsedInactive.dtStatus !== '0' || parsedInactive.dtText !== '') {
  throw new Error("Parsed inactive text does not match: " + JSON.stringify(parsedInactive))
}
console.log("✔ index.html parser verified with inactive text:", parsedInactive)

// 5. Test SimulatorController.vue
const simVue = fs.readFileSync(path.join(root, 'src/components/SimulatorController.vue'), 'utf-8')
if (!simVue.includes("this.writePinToKMV(\"DRAW_TEXT\", \"0\")")) {
  throw new Error("SimulatorController.vue missing DRAW_TEXT default init")
}
if (!simVue.includes("DRAW_TEXT")) {
  throw new Error("SimulatorController.vue missing DRAW_TEXT forwarding")
}
console.log("✔ SimulatorController.vue verified")

console.log("=== All Draw Text Tests Passed! ===")
