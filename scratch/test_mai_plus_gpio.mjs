const sim = await import('file:///c:/KMV/kidbright_MAI_ide/src/store/simulator.js')
const { CodeToSim, setPinFromKMV, getPinFromKMV, writePinToKMV, registerPinCallback } = sim

let passed = 0
let failed = 0

function assert(cond, msg) {
  if (cond) {
    console.log(`[PASS] ${msg}`)
    passed++
  } else {
    console.error(`[FAIL] ${msg}`)
    failed++
  }
}

console.log("=== Testing KidBright Micro AI Plus IO2-IO8 Read & Write Pin Support ===")

const pins = [
  { io: 'IO2', chip: 'A23' },
  { io: 'IO3', chip: 'A27' },
  { io: 'IO4', chip: 'A25' },
  { io: 'IO5', chip: 'A22' },
  { io: 'IO6', chip: 'A24' },
  { io: 'IO7', chip: 'P24' },
  { io: 'IO8', chip: 'A15' },
]

// 1. Test Unity -> Simulator Read Pin (SensorInput sends 'IOx', Blockly Python reads 'Ax')
for (const p of pins) {
  setPinFromKMV(p.io, 1)
  assert(getPinFromKMV(p.chip) === 1, `SensorInput('${p.io}', 1) -> getPinFromKMV('${p.chip}') should be 1`)
  assert(getPinFromKMV(p.io) === 1, `SensorInput('${p.io}', 1) -> getPinFromKMV('${p.io}') should be 1`)

  setPinFromKMV(p.io, 0)
  assert(getPinFromKMV(p.chip) === 0, `SensorInput('${p.io}', 0) -> getPinFromKMV('${p.chip}') should be 0`)
  assert(getPinFromKMV(p.io) === 0, `SensorInput('${p.io}', 0) -> getPinFromKMV('${p.io}') should be 0`)
}

// 2. Test Blockly -> Unity Write Pin (Blockly Python writes to 'Ax', Unity receives 'IOx')
for (const p of pins) {
  let receivedPins = {}
  registerPinCallback((pin, val) => {
    receivedPins[pin] = val
  })

  writePinToKMV(p.chip, 1)
  assert(receivedPins[p.chip] === '1', `writePinToKMV('${p.chip}', 1) emitted '${p.chip}'`)
  assert(receivedPins[p.io] === '1', `writePinToKMV('${p.chip}', 1) emitted alias '${p.io}'`)

  receivedPins = {}
  writePinToKMV(p.chip, 0)
  assert(receivedPins[p.chip] === '0', `writePinToKMV('${p.chip}', 0) emitted '${p.chip}'`)
  assert(receivedPins[p.io] === '0', `writePinToKMV('${p.chip}', 0) emitted alias '${p.io}'`)
}

// 3. Test CodeToSim with KidBright Micro AI Plus code
const rawCode = `
from maix import gpio
import time

_gpio_A23 = gpio.GPIO('A23', gpio.Mode.IN)
_gpio_A27 = gpio.GPIO('A27', gpio.Mode.OUT)

while True:
  if _gpio_A23.value():
    _gpio_A27.value(1)
  else:
    _gpio_A27.value(0)
  time.sleep(0.1)
`

const simCode = CodeToSim(rawCode)
assert(simCode.includes("class _MockGPIO:"), "CodeToSim includes _MockGPIO definition")
assert(simCode.includes("Mode = type('Mode', (), {'IN': 0, 'OUT': 1})"), "CodeToSim includes gpio.Mode definition")
assert(simCode.includes("Pull = type('Pull', (), {'PULL_NONE': 0, 'PULL_UP': 1, 'PULL_DOWN': 2})"), "CodeToSim includes gpio.Pull definition")
assert(simCode.includes("async def _kmv_user_main():"), "CodeToSim wraps code in async def _kmv_user_main()")

console.log(`\nResults: ${passed} Passed, ${failed} Failed`)
if (failed > 0) process.exit(1)
