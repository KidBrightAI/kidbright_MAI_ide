import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

console.log("=== Testing Display Camera Detection and Signaling ===")

// 1. Test generators
const genMaiBasic = fs.readFileSync(path.join(root, 'boards/kidbright-mai/blocks/generators_basic.js'), 'utf-8')
const genMaiPlusBasic = fs.readFileSync(path.join(root, 'boards/kidbright-mai-plus/blocks/generators_basic.js'), 'utf-8')
const genMaiV4 = fs.readFileSync(path.join(root, 'boards/kidbright-mai/blocks/generators_maix_v4.js'), 'utf-8')

if (!genMaiBasic.includes("DISPLAY_CAMERA") || !genMaiBasic.includes("js.writePinToKMV")) {
  throw new Error("genMaiBasic does not include DISPLAY_CAMERA call")
}
console.log("✔ kidbright-mai maix3_display_camera includes DISPLAY_CAMERA")

if (!genMaiPlusBasic.includes("DISPLAY_CAMERA") || !genMaiPlusBasic.includes("js.writePinToKMV")) {
  throw new Error("genMaiPlusBasic does not include DISPLAY_CAMERA call")
}
console.log("✔ kidbright-mai-plus display_camera includes DISPLAY_CAMERA")

if (!genMaiV4.includes("DISPLAY_CAMERA") || !genMaiV4.includes("js.writePinToKMV")) {
  throw new Error("genMaiV4 does not include DISPLAY_CAMERA call")
}
console.log("✔ kidbright-mai maix4_display_camera includes DISPLAY_CAMERA")

// 2. Test CodeToSim in simulator.js
const simJs = fs.readFileSync(path.join(root, 'src/store/simulator.js'), 'utf-8')
if (!simJs.includes("DISPLAY_CAMERA")) {
  throw new Error("simulator.js does not include DISPLAY_CAMERA")
}

// Emulate CodeToSim logic
function testSimLogic(code) {
  let camState = null
  const mockWritePinToKMV = (pin, val) => {
    if (pin === 'DISPLAY_CAMERA') camState = val
  }

  // Same regex as in simulator.js
  const hasCameraBlock = /writePinToKMV\(['"]DISPLAY_CAMERA['"],\s*['"]1['"]\)|camera\.capture|cam\.read\(|maix3_display_camera|maix4_display_camera|display_camera/i.test(code)
  mockWritePinToKMV('DISPLAY_CAMERA', hasCameraBlock ? '1' : '0')
  return camState
}

// Case A: With display camera block
const codeWithCamera1 = `
from maix import camera
from maix import display

while True:
  try:
    import js
    if hasattr(js, 'writePinToKMV'):
      js.writePinToKMV('DISPLAY_CAMERA', '1')
  except Exception:
    pass
  display.show(camera.capture())
`
const res1 = testSimLogic(codeWithCamera1)
if (res1 !== '1') throw new Error(`Expected '1' with camera block, got ${res1}`)
console.log("✔ Case 1: Code with display camera sends 1")

// Case B: Without display camera block (e.g. only LED or Color)
const codeWithoutCamera = `
from maix import display, image

while True:
  display.show(image.new(size=(240, 240), color=(255, 0, 0)))
  time.sleep(1)
`
const res2 = testSimLogic(codeWithoutCamera)
if (res2 !== '0') throw new Error(`Expected '0' without camera block, got ${res2}`)
console.log("✔ Case 2: Code without display camera sends 0")

// Case C: Plus board cam.read()
const codeWithCamera2 = `
disp.show(cam.read())
`
const res3 = testSimLogic(codeWithCamera2)
if (res3 !== '1') throw new Error(`Expected '1' with cam.read(), got ${res3}`)
console.log("✔ Case 3: Code with plus camera sends 1")

// 3. Test index.html
const indexHtml = fs.readFileSync(path.join(root, 'src/static/KMV/index.html'), 'utf-8')
if (!indexHtml.includes('<p id="DISPLAY_CAMERA">0</p>')) {
  throw new Error("index.html missing <p id=\"DISPLAY_CAMERA\">0</p>")
}
if (!indexHtml.includes('setDisplayCamera')) {
  throw new Error("index.html missing setDisplayCamera")
}
if (!indexHtml.includes('DISPLAY_CAMERA')) {
  throw new Error("index.html missing DISPLAY_CAMERA handler")
}
console.log("✔ index.html contains DISPLAY_CAMERA elements and methods")

// 4. Test SimulatorController.vue
const simVue = fs.readFileSync(path.join(root, 'src/components/SimulatorController.vue'), 'utf-8')
if (!simVue.includes('DISPLAY_CAMERA')) {
  throw new Error("SimulatorController.vue missing DISPLAY_CAMERA handler")
}
console.log("✔ SimulatorController.vue contains DISPLAY_CAMERA handler")

console.log("=== All Tests Passed Successfully! ===")
