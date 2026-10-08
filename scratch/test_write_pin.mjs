import fs from 'fs'

const simCode = fs.readFileSync('src/store/simulator.js', 'utf-8')

// Mock environment
let callbackResult = {}
const currentPinCallback = (pin, val) => {
  callbackResult[pin] = val
}

const pinStates = {}
const PIN_MAP = {
  'IO2': ['IO2', 'A23', '23', '2'],
  'A23': ['IO2', 'A23', '23', '2'],
}
const buzzerSynth = { playTone: () => {}, stopTone: () => {} }

// Evaluate writePinToKMV extracted from simulator.js
const extract = simCode.slice(simCode.indexOf('export const writePinToKMV ='), simCode.indexOf('export const setPinFromKMV ='))
const fnBody = extract.replace('export const writePinToKMV =', 'const writePinToKMV =')

const testRunner = new Function('currentPinCallback', 'pinStates', 'PIN_MAP', 'buzzerSynth', `
${fnBody}
return writePinToKMV;
`)

const writePinToKMV = testRunner(currentPinCallback, pinStates, PIN_MAP, buzzerSynth)

console.log("=== Testing writePinToKMV ===")

// Test 1: Color 10
callbackResult = {}
writePinToKMV('DISPLAY_COLOR', '10')
console.log('DISPLAY_COLOR 10:', callbackResult)
if (callbackResult['DISPLAY_COLOR'] === '10') {
  console.log('[PASS] DISPLAY_COLOR 10 retained!')
} else {
  console.error('[FAIL] Expected 10, got', callbackResult['DISPLAY_COLOR'])
  process.exit(1)
}

// Test 2: Color 70
callbackResult = {}
writePinToKMV('DISPLAY_COLOR', 70)
console.log('DISPLAY_COLOR 70:', callbackResult)
if (callbackResult['DISPLAY_COLOR'] === '70') {
  console.log('[PASS] DISPLAY_COLOR 70 retained!')
} else {
  console.error('[FAIL] Expected 70, got', callbackResult['DISPLAY_COLOR'])
  process.exit(1)
}

// Test 3: Board 2
callbackResult = {}
writePinToKMV('BOARD', '2')
console.log('BOARD 2:', callbackResult)
if (callbackResult['BOARD'] === '2') {
  console.log('[PASS] BOARD 2 retained!')
} else {
  console.error('[FAIL] Expected 2, got', callbackResult['BOARD'])
  process.exit(1)
}

// Test 4: GPIO Pin 14
callbackResult = {}
writePinToKMV('14', 1)
console.log('Pin 14 (1):', callbackResult)
if (callbackResult['14'] === '1') {
  console.log('[PASS] GPIO Pin 14 (1) is 1!')
} else {
  console.error('[FAIL] Expected 1, got', callbackResult['14'])
  process.exit(1)
}

callbackResult = {}
writePinToKMV('14', 0)
console.log('Pin 14 (0):', callbackResult)
if (callbackResult['14'] === '0') {
  console.log('[PASS] GPIO Pin 14 (0) is 0!')
} else {
  console.error('[FAIL] Expected 0, got', callbackResult['14'])
  process.exit(1)
}

// Test 5: Boolean True/False
callbackResult = {}
writePinToKMV('A23', true)
if (callbackResult['A23'] === '1' && callbackResult['IO2'] === '1') {
  console.log('[PASS] A23 boolean true is 1 and alias IO2 is 1!')
} else {
  console.error('[FAIL] Expected 1, got', callbackResult)
  process.exit(1)
}

console.log('\nALL TESTS PASSED SUCCESSFULLY!')
