//simulator edit (start)
import { ref } from 'vue'

// 1. State & Cache เก็บค่า Pin และ Switch ล่าสุด
const pinStates = {}
const switchStates = { S1: false, S2: false }

// Callbacks สำหรับส่งค่าไปยัง UI Component
let currentPinCallback = null
let currentHighlightCallback = null
let stepResolver = null

// สถานะการรันของ Simulator
export const SIM_STATE = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  STEPPING: 'STEPPING',
}

export const simState = ref(SIM_STATE.IDLE)
export const simSpeed = ref(250) // ความเร็วการรันในหน่วย ms ต่อบล็อก (ค่าเริ่มต้น 250ms)
export const currentBlockId = ref(null)

if (typeof window !== 'undefined') {
  window._kmv_sim_running = false
}

export function registerHighlightCallback(callback) {
  currentHighlightCallback = callback
}

export function highlightBlockInIDE(blockId) {
  currentBlockId.value = blockId || null
  if (currentHighlightCallback) {
    try {
      currentHighlightCallback(blockId || null)
    } catch (e) {
      console.warn("[Simulator] highlight callback error:", e)
    }
  }
}

// Web Audio Synthesizer for Buzzer sound (inspired by kbide-simulator sound.js)
class WebAudioBuzzer {
  constructor() {
    this.audioCtx = null
    this.oscillator = null
    this.gainNode = null
    this.isPlaying = false
  }

  initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass()
      }
    }
  }

  playTone(freq = 1000, durationMs = null) {
    try {
      this.initContext()
      if (!this.audioCtx) return

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume()
      }

      this.stopTone()

      this.oscillator = this.audioCtx.createOscillator()
      this.gainNode = this.audioCtx.createGain()

      this.oscillator.type = 'square'
      this.oscillator.frequency.value = Number(freq) || 1000

      // Comfortable volume
      this.gainNode.gain.setValueAtTime(0.12, this.audioCtx.currentTime)

      this.oscillator.connect(this.gainNode)
      this.gainNode.connect(this.audioCtx.destination)

      this.oscillator.start()
      this.isPlaying = true

      if (durationMs && durationMs > 0) {
        setTimeout(() => {
          this.stopTone()
        }, durationMs)
      }
    } catch (e) {
      console.warn("[Buzzer] Web Audio error:", e)
    }
  }

  stopTone() {
    if (this.isPlaying && this.oscillator) {
      try {
        this.oscillator.stop()
        this.oscillator.disconnect()
      } catch (e) {}
      this.oscillator = null
      this.isPlaying = false
    }
  }
}

const buzzerSynth = new WebAudioBuzzer()

// 2. ฟังก์ชันตรวจสอบและโหลด Pyodide (WebAssembly Python)
let pyodidePromise = null

export async function ensurePyodide() {
  if (typeof window === 'undefined') return null
  if (window.pyodide) return window.pyodide
  if (pyodidePromise) return pyodidePromise

  pyodidePromise = (async () => {
    if (typeof window.loadPyodide !== 'function') {
      await new Promise((resolve, reject) => {
        const existing = document.querySelector('script[src*="pyodide.js"]')
        if (existing) {
          existing.addEventListener('load', resolve)
          existing.addEventListener('error', reject)
          return
        }
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    if (typeof window.loadPyodide === 'function') {
      window.pyodide = await window.loadPyodide()
    }
    return window.pyodide
  })()

  return pyodidePromise
}

// 3. ฟังก์ชันควบคุมการรัน (Run, Pause, Resume, Step, Stop, Speed)
export function startSimulator(mode = SIM_STATE.RUNNING) {
  if (typeof window !== 'undefined') {
    window._kmv_sim_running = true
  }
  simState.value = mode
}

export function pauseSimulator() {
  if (simState.value === SIM_STATE.RUNNING) {
    simState.value = SIM_STATE.PAUSED
    console.log("[Simulator] Paused at block:", currentBlockId.value)
  }
}

export function resumeSimulator() {
  if (simState.value === SIM_STATE.PAUSED || simState.value === SIM_STATE.STEPPING) {
    simState.value = SIM_STATE.RUNNING
    console.log("[Simulator] Resumed running")
    if (stepResolver) {
      const resolve = stepResolver
      stepResolver = null
      resolve()
    }
  }
}

export function stepSimulator() {
  if (simState.value === SIM_STATE.PAUSED || simState.value === SIM_STATE.STEPPING) {
    simState.value = SIM_STATE.STEPPING
    console.log("[Simulator] Stepping 1 block...")
    if (stepResolver) {
      const resolve = stepResolver
      stepResolver = null
      resolve()
    }
  }
}

export function stopSimulatorPython() {
  if (typeof window !== 'undefined') {
    window._kmv_sim_running = false
  }
  simState.value = SIM_STATE.IDLE
  highlightBlockInIDE(null)
  buzzerSynth.stopTone()
  writePinToKMV('DISPLAY_CAMERA', '0')
  writePinToKMV('DRAW_TEXT', '0')
  if (stepResolver) {
    const resolve = stepResolver
    stepResolver = null
    resolve()
  }
}

export function setSimulatorSpeed(ms) {
  simSpeed.value = Math.max(0, Math.min(2000, Number(ms) || 250))
}

export function onSimulatorFinish() {
  simState.value = SIM_STATE.IDLE
  highlightBlockInIDE(null)
  buzzerSynth.stopTone()
  writePinToKMV('DISPLAY_CAMERA', '0')
  writePinToKMV('DRAW_TEXT', '0')
  if (stepResolver) {
    const resolve = stepResolver
    stepResolver = null
    resolve()
  }
}

// ฟังก์ชันหลักในการรันโค้ด Python ผ่าน Pyodide
export async function runSimulatorPython(rawCode) {
  if (!rawCode || typeof rawCode !== 'string' || rawCode.trim().length === 0) {
    console.warn("[Simulator] Empty code provided, skipping execution.")
    return
  }

  // หากมีงานเก่าค้างอยู่ ให้สั่งหยุดก่อนเริ่มงานใหม่
  if (typeof window !== 'undefined' && window._kmv_sim_running) {
    stopSimulatorPython()
    await new Promise(r => setTimeout(r, 100))
  }

  startSimulator(SIM_STATE.RUNNING)

  try {
    const pyodide = await ensurePyodide()
    if (!pyodide) {
      throw new Error("Pyodide engine could not be initialized.")
    }

    const simCode = CodeToSim(rawCode)
    console.log("[Simulator] Running Python simulation in Pyodide...")

    await pyodide.runPythonAsync(simCode)
    console.log("[Simulator] Python simulation completed successfully.")
  } catch (err) {
    const errStr = String(err && (err.message || err))
    if (errStr.includes("SIM_STOPPED") || errStr.includes("KeyboardInterrupt")) {
      console.log("[Simulator] Execution stopped by user.")
    } else {
      console.error("[Simulator Runtime Error]:", err)
    }
  } finally {
    onSimulatorFinish()
  }
}

// Hook ที่ Python จะเรียกก่อนประมวลผลแต่ละบล็อก
export function _kmv_step_hook(blockId) {
  if (typeof window !== 'undefined' && !window._kmv_sim_running) {
    highlightBlockInIDE(null)
    simState.value = SIM_STATE.IDLE

    return Promise.reject(new Error("SIM_STOPPED"))
  }

  // ไฮไลต์บล็อกปัจจุบันบน Blockly
  highlightBlockInIDE(blockId)

  // ถ้าอยู่ในโหมด STEPPING: ให้สลับกลับเป็น PAUSED แล้วรอคำสั่ง Step/Resume รอบถัดไป
  if (simState.value === SIM_STATE.STEPPING) {
    simState.value = SIM_STATE.PAUSED

    return new Promise(resolve => {
      stepResolver = resolve
    })
  }

  // ถ้าอยู่ในโหมด PAUSED: รอจนกว่าผู้ใช้จะกด Step หรือ Resume
  if (simState.value === SIM_STATE.PAUSED) {
    return new Promise(resolve => {
      stepResolver = resolve
    })
  }

  // ถ้าอยู่ในโหมด RUNNING: หน่วงเวลาตาม simSpeed ก่อนไปบล็อกถัดไป
  const delay = simSpeed.value
  if (delay > 0) {
    return new Promise(resolve => {
      let timer = null
      timer = setTimeout(() => {
        stepResolver = null
        resolve()
      }, delay)

      // ปลดล็อคได้ทันทีหากมีคำสั่ง Pause / Stop ระหว่างหน่วงเวลา
      stepResolver = () => {
        if (timer) clearTimeout(timer)
        resolve()
      }
    })
  }

  return Promise.resolve()
}

// 4. ฟังก์ชันแปลงโค้ด Python ก่อนรันใน Simulator
export function CodeToSim(code) {
  if (!code) return ""

  // 4.1 Fast-path: สแกนหาคำสั่งเขียน Pin ในโค้ดเริ่มต้น (เฉพาะก่อนเข้าลูปแรกหรือก่อนเจอ sleep)
  try {
    const preLoopCode = code.split(/\b(?:while|for)\b/)[0].split(/\b(?:time\.)?sleep\b/)[0]
    const regex = /writePinToKMV\(['"]([^'"]+)['"],\s*(?:String\()?['"]?([0-9]+|True|False)['"]?\)?\)/g
    let match
    while ((match = regex.exec(preLoopCode)) !== null) {
      const pin = match[1]
      let val = match[2]
      if (val === 'True') val = '1'
      if (val === 'False') val = '0'
      writePinToKMV(pin, val)
    }
  } catch (e) {
    console.warn("[CodeToSim] Fast-path scan warning:", e)
  }

  // 4.1.1 สแกนหาการเรียกใช้ Block display camera: หากเรียกใช้ส่ง 1 หากไม่ได้เรียกใช้ส่ง 0
  try {
    const hasCameraBlock = /writePinToKMV\(['"]DISPLAY_CAMERA['"],\s*['"]1['"]\)|camera\.capture|cam\.read\(|maix3_display_camera|maix4_display_camera|display_camera/i.test(code)
    writePinToKMV('DISPLAY_CAMERA', hasCameraBlock ? '1' : '0')
  } catch (e) {
    console.warn("[CodeToSim] Camera check warning:", e)
  }

  // 4.1.2 สแกนหาการเรียกใช้ Block draw text: หากไม่ได้เรียกใช้ให้ส่ง 0
  try {
    const hasDrawTextBlock = /writePinToKMV\(['"]DRAW_TEXT['"]|draw_string\s*\(|display_draw_string|maix3_draw_string|maix4_draw_string/i.test(code)
    if (!hasDrawTextBlock) {
      writePinToKMV('DRAW_TEXT', '0')
    } else {
      const preLoopCode = code.split(/\b(?:while|for)\b/)[0].split(/\b(?:time\.)?sleep\b/)[0]
      const dtMatch = preLoopCode.match(/writePinToKMV\(['"]DRAW_TEXT['"],\s*['"]([^'"]+)['"]\)/i)
      if (dtMatch && dtMatch[1]) {
        writePinToKMV('DRAW_TEXT', dtMatch[1])
      }
    }
  } catch (e) {
    console.warn("[CodeToSim] Draw text check warning:", e)
  }

  // 4.2 แปลง sleep() และ time.sleep() ให้เป็น await _kmv_sleep() เพื่อหยุดได้ทันทีเมื่อกดยกเลิก
  let asyncCode = code
    .replace(/\bfrom\s+time\s+import\s+sleep\b/g, "# from time import sleep")
    .replace(/\btime\.sleep\s*\(/g, "await _kmv_sleep(")
    .replace(/(^|[^\w.])sleep\s*\(/g, "$1await _kmv_sleep(")

  // 4.3 ป้องกันลูป while ค้าง และรองรับการสั่งหยุดผ่าน window._kmv_sim_running พร้อม yield ให้เบราว์เซอร์
  asyncCode = asyncCode.replace(
    /(^[ \t]*)while\s+([^:\n]+)\s*:/gm,
    (match, indent, cond) => {
      const trimmed = cond.trim()
      let condCode = `getattr(sys.modules.get('js', None), '_kmv_sim_running', True)`
      if (trimmed !== 'True' && trimmed !== '1' && !trimmed.includes('_kmv_sim_running')) {
        condCode += ` and (${trimmed})`
      }
      return `${indent}while ${condCode}:\n${indent}  await asyncio.sleep(0.005)`
    }
  )

  // 4.4 ป้องกันลูป for ค้าง และรองรับการสั่งหยุดผ่าน window._kmv_sim_running พร้อม yield ให้เบราว์เซอร์
  asyncCode = asyncCode.replace(
    /(^[ \t]*)for\s+([^:\n]+)\s*:/gm,
    (match, indent, loopExpr) => {
      return `${indent}for ${loopExpr}:\n${indent}  if not getattr(sys.modules.get('js', None), '_kmv_sim_running', True): break\n${indent}  await asyncio.sleep(0.005)`
    }
  )

  // 4.5 ปรับโค้ดอ่าน Pin ให้ตรงกับค่า 0 หรือ 1 ที่ Simulator/Unity ส่งเข้ามา
  // สำหรับ KidBright-MAI ฮาร์ดแวร์จริงมีการใช้ active-low pull-up จึงสร้างโค้ด (1 - (_gpio_...get_value())) หรือ (1 - (Pin(...).value()))
  // ใน Simulator ค่าจาก Unity ที่ส่งผ่าน SensorInput(pin, value) เป็น 0 หรือ 1 ตรงๆ
  asyncCode = asyncCode
    .replace(/\(1\s*-\s*\(\s*(_gpio_\w+\.get_value\(\))\s*\)\)/g, '($1)')
    .replace(/\(1\s*-\s*\(\s*(_gpio_\w+\.value\(\))\s*\)\)/g, '($1)')
    .replace(/\(1\s*-\s*\(\s*(Pin\([^)]+\)\.value\(\))\s*\)\)/g, '($1)')
    .replace(/\b1\s*-\s*(_gpio_\w+\.get_value\(\))/g, '$1')
    .replace(/\b1\s*-\s*(_gpio_\w+\.value\(\))/g, '$1')
    .replace(/\b1\s*-\s*(Pin\([^)]+\)\.value\(\))/g, '$1')

  // 4.6 แทรก asyncio.sleep ให้กับบล็อกว่าง (pass) เพื่อป้องกันลูปว่างดูด CPU
  asyncCode = asyncCode.replace(/(\n[ \t]*)pass([ \t]*(?:\n|$))/g, '$1await asyncio.sleep(0.01)\n$1pass$2')

  // ย่อหน้าโค้ดผู้ใช้ให้อยู่ภายใต้ coroutine function
  const indentedUserCode = asyncCode
    .split('\n')
    .map(line => line.trim().length > 0 ? '    ' + line : '')
    .join('\n')

  const userBody = indentedUserCode.trim().length > 0 ? indentedUserCode : '    pass'

  // 4.5 Mock สภาพแวดล้อมโมดูลฮาร์ดแวร์ทั้งหมดสำหรับ Pyodide บนเบราว์เซอร์
  const mockHeader = `
import sys
import asyncio
from types import ModuleType

try:
    import js
except Exception:
    js = None

# Mock signal and os for WebAssembly compatibility
try:
    import signal
    signal.signal = lambda *args, **kwargs: None
    signal.SIGINT = 2
    signal.SIGTERM = 15
except Exception:
    pass

try:
    import os
    class _MockPopen:
        def __enter__(self): return []
        def __exit__(self, *args): pass
        def __iter__(self): return iter([])
    os.popen = lambda *args, **kwargs: _MockPopen()
    def _mock_os_system(cmd):
        cmd_str = str(cmd)
        if 'speaker-test' in cmd_str:
            try:
                import js
                if hasattr(js, 'writePinToKMV'):
                    js.writePinToKMV('BUZZER', '1')
            except Exception:
                pass
        return 0
    os.system = _mock_os_system
except Exception:
    pass

# Mock sysfs files for board_led (/sys/class/leds/led-user/...)
try:
    import builtins
    _real_open = builtins.open
    class _MockSysfsFile:
        def __init__(self, path, mode='r'): self.path = path
        def __enter__(self): return self
        def __exit__(self, *args): pass
        def write(self, s):
            try:
                import js
                if 'brightness' in self.path and hasattr(js, 'writePinToKMV'):
                    v = '1' if int(str(s).strip() or '0') > 0 else '0'
                    js.writePinToKMV('LED', v)
                    js.writePinToKMV('PH14', v)
            except Exception:
                pass
            return len(str(s))
        def read(self, *args): return '0'
    def _open_override(path, mode='r', *args, **kwargs):
        if '/sys/class/leds' in str(path):
            return _MockSysfsFile(str(path), mode)
        return _real_open(path, mode, *args, **kwargs)
    builtins.open = _open_override
except Exception:
    pass

# Mock 'maix' module & submodules
if 'maix' not in sys.modules:
    _KMV_COLOUR_PALETTE_70 = [
        "#ffffff", "#cccccc", "#c0c0c0", "#999999", "#666666", "#333333", "#000000",
        "#ffcccc", "#ff6666", "#ff0000", "#cc0000", "#990000", "#660000", "#330000",
        "#ffcc99", "#ff9966", "#ff9900", "#ff6600", "#cc6600", "#993300", "#663300",
        "#ffff99", "#ffff66", "#ffcc66", "#ffcc33", "#cc9933", "#996633", "#663333",
        "#ffffcc", "#ffff33", "#ffff00", "#ffcc00", "#999900", "#666600", "#333300",
        "#99ff99", "#66ff99", "#33ff33", "#33cc00", "#009900", "#006600", "#003300",
        "#99ffff", "#33ffff", "#66cccc", "#00cccc", "#339999", "#336666", "#003333",
        "#ccffff", "#66ffff", "#33ccff", "#3366ff", "#3333ff", "#000099", "#000066",
        "#ccccff", "#9999ff", "#6666cc", "#6633ff", "#6600cc", "#333399", "#330099",
        "#ffccff", "#ff99ff", "#cc66cc", "#cc33cc", "#993399", "#663366", "#330033"
    ]

    def _kmv_rgb_to_color_index(color):
        try:
            if isinstance(color, (list, tuple)) and len(color) >= 3:
                r, g, b = int(color[0]), int(color[1]), int(color[2])
                hex_c = f'#{r:02x}{g:02x}{b:02x}'
                if hex_c in _KMV_COLOUR_PALETTE_70:
                    return _KMV_COLOUR_PALETTE_70.index(hex_c) + 1
                best_idx = 1
                min_dist = float('inf')
                for idx, pal_hex in enumerate(_KMV_COLOUR_PALETTE_70):
                    pr = int(pal_hex[1:3], 16)
                    pg = int(pal_hex[3:5], 16)
                    pb = int(pal_hex[5:7], 16)
                    dist = (r - pr)**2 + (g - pg)**2 + (b - pb)**2
                    if dist < min_dist:
                        min_dist = dist
                        best_idx = idx + 1
                return best_idx
        except Exception:
            pass
        return 10

    class _MockImage:
        def __init__(self, *args, **kwargs):
            self.size = kwargs.get('size', (240, 240))
            self.color_index = None
            if 'color' in kwargs:
                self.color_index = _kmv_rgb_to_color_index(kwargs['color'])
        def draw_string(self, *args, **kwargs):
            try:
                import js
                if hasattr(js, 'writePinToKMV'):
                    x = args[0] if len(args) > 0 else kwargs.get('x', 0)
                    y = args[1] if len(args) > 1 else kwargs.get('y', 0)
                    txt = args[2] if len(args) > 2 else kwargs.get('text', '')
                    scale = kwargs.get('scale', 1)
                    col = kwargs.get('color', None)
                    c_idx = _kmv_rgb_to_color_index(col) if col else 10
                    js.writePinToKMV('DRAW_TEXT', f"1,{txt},{x},{y},{c_idx},{scale}")
            except Exception:
                pass
            return self
        def draw_line(self, *args, **kwargs): return self
        def draw_rectangle(self, *args, **kwargs): return self
        def draw_rect(self, *args, **kwargs):
            if 'color' in kwargs:
                self.color_index = _kmv_rgb_to_color_index(kwargs['color'])
            return self
        def draw_circle(self, *args, **kwargs): return self
        def draw_ellipse(self, *args, **kwargs): return self
        def resize(self, *args, **kwargs): return self
        def crop(self, *args, **kwargs): return self
        def rotate(self, *args, **kwargs): return self
        def flip(self, *args, **kwargs): return self
        def copy(self, *args, **kwargs): return self
        def save(self, *args, **kwargs): pass
        def to_bytes(self, *args, **kwargs): return b''
        def to_format(self, *args, **kwargs): return self
        def from_bytes(self, *args, **kwargs): return self
        def __getattr__(self, name): return lambda *args, **kwargs: self
        @staticmethod
        def open(*args, **kwargs): return _MockImage()
        @staticmethod
        def new(*args, **kwargs):
            img = _MockImage(*args, **kwargs)
            if 'color' in kwargs:
                img.color_index = _kmv_rgb_to_color_index(kwargs['color'])
            return img

    class _MockColor:
        @staticmethod
        def from_rgb(r, g, b): return (r, g, b)

    class _MockCamera:
        def __init__(self, *args, **kwargs):
            self.w = args[0] if len(args) > 0 else 240
            self.h = args[1] if len(args) > 1 else 240
        def capture(self, *args, **kwargs):
            try:
                import js
                if hasattr(js, 'writePinToKMV'):
                    js.writePinToKMV('DISPLAY_CAMERA', '1')
            except Exception:
                pass
            return _MockImage()
        def read(self, *args, **kwargs):
            try:
                import js
                if hasattr(js, 'writePinToKMV'):
                    js.writePinToKMV('DISPLAY_CAMERA', '1')
            except Exception:
                pass
            return (True, _MockImage())
        def width(self, *args, **kwargs): return self.w
        def height(self, *args, **kwargs): return self.h
        def close(self, *args, **kwargs): pass
        def config(self, *args, **kwargs): pass
        def __getattr__(self, name): return lambda *args, **kwargs: None
        @property
        def camera(self): return self

    _MockCamera.Camera = _MockCamera
    _MockCamera.camera = _MockCamera

    class _MockDisplay:
        def __init__(self, *args, **kwargs):
            self.w = kwargs.get('width', 240)
            self.h = kwargs.get('height', 240)
        def show(self, *args, **kwargs):
            try:
                import js
                if hasattr(js, 'writePinToKMV') and len(args) > 0:
                    img = args[0]
                    c_idx = getattr(img, 'color_index', None)
                    if c_idx is not None:
                        js.writePinToKMV('DISPLAY_COLOR', str(c_idx))
            except Exception:
                pass
        def fill(self, *args, **kwargs):
            try:
                import js
                if hasattr(js, 'writePinToKMV') and len(args) > 0:
                    c_idx = _kmv_rgb_to_color_index(args[0])
                    if c_idx is not None:
                        js.writePinToKMV('DISPLAY_COLOR', str(c_idx))
            except Exception:
                pass
        def width(self, *args, **kwargs): return self.w
        def height(self, *args, **kwargs): return self.h
        def config(self, *args, **kwargs): pass
        def as_image(self, *args, **kwargs): return _MockImage()
        def __getattr__(self, name): return lambda *args, **kwargs: None

    _MockDisplay.Display = _MockDisplay
    _MockDisplay.display = _MockDisplay

    _A_TO_IO_MAP = {
        'A23': 'IO2',
        'A27': 'IO3',
        'A25': 'IO4',
        'A22': 'IO5',
        'A24': 'IO6',
        'P24': 'IO7',
        'A15': 'IO8',
        'A17': 'IO9',
        'A14': 'IO10',
    }
    _IO_TO_A_MAP = {v: k for k, v in _A_TO_IO_MAP.items()}

    class _MockGPIO:
        OUT = 1
        IN = 0
        Mode = type('Mode', (), {'IN': 0, 'OUT': 1})
        Pull = type('Pull', (), {'PULL_NONE': 0, 'PULL_UP': 1, 'PULL_DOWN': 2})
        def __init__(self, *args, **kwargs):
            p = str(args[0]) if len(args) > 0 else str(kwargs.get('pin', '14'))
            self.pin = p
            if p in _A_TO_IO_MAP:
                self.pin_name = _A_TO_IO_MAP[p]
            elif p in _IO_TO_A_MAP:
                self.pin_name = p
            elif p.isdigit():
                self.pin_name = 'PH' + p
            else:
                self.pin_name = p
        def set_value(self, val):
            try:
                import js
                v = '1' if (val is True or val == 1 or str(val).lower() in ('true', '1')) else '0'
                if hasattr(js, 'writePinToKMV'):
                    js.writePinToKMV(str(self.pin_name), v)
                    if self.pin != self.pin_name:
                        js.writePinToKMV(str(self.pin), v)
            except Exception:
                pass
        def get_value(self):
            try:
                import js
                if hasattr(js, 'getPinFromKMV'):
                    v = js.getPinFromKMV(str(self.pin_name))
                    if v != 0: return int(v)
                    v2 = js.getPinFromKMV(str(self.pin))
                    if v2 != 0: return int(v2)
                    return int(v)
                return 0
            except Exception:
                return 0
        def value(self, *args):
            if len(args) > 0:
                self.set_value(args[0])
            else:
                return self.get_value()

    _MockGPIO.gpio = _MockGPIO
    _MockGPIO.GPIO = _MockGPIO
    _MockGPIO.Mode = _MockGPIO.Mode
    _MockGPIO.Pull = _MockGPIO.Pull

    _gpio_mod = ModuleType('maix.gpio')
    _gpio_mod.gpio = _MockGPIO
    _gpio_mod.GPIO = _MockGPIO
    _gpio_mod.OUT = 1
    _gpio_mod.IN = 0
    _gpio_mod.Mode = _MockGPIO.Mode
    _gpio_mod.Pull = _MockGPIO.Pull

    class _MockADC:
        RES_BIT_12 = 12
        ATTN_11DB = 3
        WIDTH_12BIT = 3
        def __init__(self, *args, **kwargs):
            p = args[0] if len(args) > 0 else '0'
            self.pin = getattr(p, 'pin', str(p))
        def read(self):
            try:
                import js
                if hasattr(js, 'getSwitchFromKMV'):
                    if js.getSwitchFromKMV('S1'): return 100
                    if js.getSwitchFromKMV('S2'): return 500
                    return 1500
                return int(js.getPinFromKMV(str(self.pin)))
            except Exception:
                return 0
        def value(self):
            return self.read()
        def atten(self, *args): pass
        def width(self, *args): pass

    _MockADC.ADC = _MockADC

    class _MockAudio:
        class Player:
            def __init__(self, *args, **kwargs): pass
            def play(self):
                try:
                    import js
                    if hasattr(js, 'writePinToKMV'):
                        js.writePinToKMV('BUZZER', '1')
                except Exception:
                    pass

    class _MockI2C:
        def __init__(self, *args, **kwargs): pass

    _m = ModuleType('maix')
    _m.camera = _MockCamera()
    _m.Camera = _MockCamera
    _m.display = _MockDisplay()
    _m.Display = _MockDisplay
    _m.image = ModuleType('maix.image')
    _m.image.Image = _MockImage
    _m.image.new = lambda *args, **kwargs: _MockImage()
    _m.image.open = lambda *args, **kwargs: _MockImage()
    _m.image.Color = _MockColor
    _m.gpio = _gpio_mod
    _m.GPIO = _MockGPIO
    _m.adc = _MockADC
    _m.ADC = _MockADC
    _m.audio = _MockAudio
    _m.i2c = ModuleType('maix.i2c')
    _m.i2c.I2C = _MockI2C

    # Mock 'maix.ext_dev.imu'
    _ext_dev = ModuleType('maix.ext_dev')
    _imu_mod = ModuleType('maix.ext_dev.imu')
    class _MockIMU:
        Mode = type('Mode', (), {'DUAL': 0})
        AccScale = type('AccScale', (), {'ACC_SCALE_2G': 0})
        AccOdr = type('AccOdr', (), {'ACC_ODR_8000': 0})
        GyroScale = type('GyroScale', (), {'GYRO_SCALE_16DPS': 0})
        GyroOdr = type('GyroOdr', (), {'GYRO_ODR_8000': 0})
        def __init__(self, *args, **kwargs): pass
        def read(self): return [0.0, 0.0, 9.8, 0.0, 0.0, 0.0, 25.0]
    _imu_mod.IMU = _MockIMU
    _imu_mod.Mode = _MockIMU.Mode
    _imu_mod.AccScale = _MockIMU.AccScale
    _imu_mod.AccOdr = _MockIMU.AccOdr
    _imu_mod.GyroScale = _MockIMU.GyroScale
    _imu_mod.GyroOdr = _MockIMU.GyroOdr
    _ext_dev.imu = _imu_mod
    _m.ext_dev = _ext_dev

    sys.modules['maix'] = _m
    sys.modules['maix.camera'] = _m.camera
    sys.modules['maix.display'] = _m.display
    sys.modules['maix.image'] = _m.image
    sys.modules['maix.gpio'] = _gpio_mod
    sys.modules['maix.adc'] = _MockADC
    sys.modules['maix.audio'] = _MockAudio
    sys.modules['maix.i2c'] = _m.i2c
    sys.modules['maix.ext_dev'] = _ext_dev
    sys.modules['maix.ext_dev.imu'] = _imu_mod

# Mock 'v831adc' module
if 'v831adc' not in sys.modules:
    class _MockV831ADC:
        def __init__(self, *args, **kwargs): pass
        def value(self):
            try:
                import js
                if hasattr(js, 'getSwitchFromKMV'):
                    if js.getSwitchFromKMV('S1'): return 100
                    if js.getSwitchFromKMV('S2'): return 500
                    return 1500
            except Exception:
                pass
            return 1500
    _v = ModuleType('v831adc')
    _v.v83x_ADC = _MockV831ADC
    sys.modules['v831adc'] = _v

# Mock 'machine' module
if 'machine' not in sys.modules:
    class _MockMachinePin:
        IN = 0
        OUT = 1
        def __init__(self, pin, *args, **kwargs):
            p = str(pin)
            self.pin = p
            self.pin_name = ('PH' + p) if p.isdigit() else p
        def value(self, *args):
            try:
                import js
                if len(args) > 0:
                    v = '1' if (args[0] is True or args[0] == 1 or str(args[0]).lower() in ('true', '1')) else '0'
                    if hasattr(js, 'writePinToKMV'):
                        js.writePinToKMV(str(self.pin_name), v)
                        if self.pin != self.pin_name:
                            js.writePinToKMV(str(self.pin), v)
                else:
                    if hasattr(js, 'getPinFromKMV'):
                        return int(js.getPinFromKMV(str(self.pin_name)))
                    return 0
            except Exception:
                return 0
        def on(self): self.value(1)
        def off(self): self.value(0)
        def high(self): self.value(1)
        def low(self): self.value(0)

    _MockMachinePin.Pin = _MockMachinePin

    class _MockMachinePWM:
        def __init__(self, pin, *args, **kwargs):
            self.pin = getattr(pin, 'pin', str(pin))
        def freq(self, *args): pass
        def duty_u16(self, *args):
            try:
                import js
                if len(args) > 0:
                    if hasattr(js, 'writePinToKMV'):
                        js.writePinToKMV(self.pin, str(int(args[0])))
            except Exception:
                pass

    _mach = ModuleType('machine')
    _mach.Pin = _MockMachinePin
    _mach.PWM = _MockMachinePWM
    _mach.ADC = sys.modules['maix'].adc
    _mach.lightsleep = lambda *args, **kwargs: None
    _mach.deepsleep = lambda *args, **kwargs: None
    _mach.reset_cause = lambda: 0
    _mach.DEEPSLEEP_RESET = 1
    sys.modules['machine'] = _mach

Pin = sys.modules['machine'].Pin

# Mock 'msa311' accelerometer
if 'msa311' not in sys.modules:
    class _MockMSA:
        acceleration = (0.0, 0.0, 9.8)
        tapped = False
        def __init__(self, *args, **kwargs): pass
        def enable_tap_detection(self): pass
    _msa = ModuleType('msa311')
    _msa.MSA311 = _MockMSA
    sys.modules['msa311'] = _msa

# Mock 'servo' module
if 'servo' not in sys.modules:
    class _MockServo:
        def __init__(self, pin, *args, **kwargs):
            self.pin = str(pin)
        def set_angle(self, angle):
            try:
                import js
                if hasattr(js, 'writePinToKMV'):
                    js.writePinToKMV(self.pin, str(angle))
            except Exception:
                pass
    _servo_mod = ModuleType('servo')
    _servo_mod.V831Servo = _MockServo
    _servo_mod.C906Servo = _MockServo
    sys.modules['servo'] = _servo_mod

# Mock AI runtime modules (classifier_runtime, detector_runtime, voice_runtime, voice_cpu_infer)
if 'classifier_runtime' not in sys.modules:
    class _MockClassifier:
        def __init__(self, hash="", labels=None):
            self.labels = labels or ["Simulated_Object"]
        def classify(self, img=None):
            lbl = self.labels[0] if self.labels else "Simulated_Object"
            return {"class_id": 0, "label": lbl, "probability": 0.98}
    _cr = ModuleType('classifier_runtime')
    _cr.Classifier = _MockClassifier
    sys.modules['classifier_runtime'] = _cr

if 'detector_runtime' not in sys.modules:
    class _MockDetectorBox:
        def __init__(self, label):
            self.x = 20
            self.y = 20
            self.w = 60
            self.h = 60
            self.class_id = 0
            self.label = label
            self.score = 0.95
    class _MockDetector:
        def __init__(self, hash="", labels=None):
            self.labels = labels or ["Simulated_Object"]
        def detect(self, img=None, conf=0.5, iou=0.45):
            lbl = self.labels[0] if self.labels else "Simulated_Object"
            return [_MockDetectorBox(lbl)]
    _dr = ModuleType('detector_runtime')
    _dr.Detector = _MockDetector
    sys.modules['detector_runtime'] = _dr

if 'voice_runtime' not in sys.modules:
    class _MockVoiceModel:
        def __init__(self, path=""):
            self.labels = ["Sound_1", "Background"]
        def classify(self, duration=1):
            return {"label": self.labels[0], "index": 0, "prob": 0.96}
        def get_rms(self):
            return 512
    _vr = ModuleType('voice_runtime')
    _vr.Model = _MockVoiceModel
    sys.modules['voice_runtime'] = _vr

if 'voice_cpu_infer' not in sys.modules:
    sys.modules['voice_cpu_infer'] = sys.modules['voice_runtime']

async def _kmv_sleep(secs):
    import sys, asyncio
    try:
        total = float(secs)
    except Exception:
        total = 0.0
    elapsed = 0.0
    step = 0.05
    while elapsed < total:
        if not getattr(sys.modules.get('js', None), '_kmv_sim_running', True):
            raise KeyboardInterrupt("SIM_STOPPED")
        to_sleep = min(step, total - elapsed)
        await asyncio.sleep(to_sleep)
        elapsed += to_sleep
    if not getattr(sys.modules.get('js', None), '_kmv_sim_running', True):
        raise KeyboardInterrupt("SIM_STOPPED")

def _kmv_step(block_id):
    import sys
    if not getattr(sys.modules.get('js', None), '_kmv_sim_running', True):
        raise KeyboardInterrupt("SIM_STOPPED")
    import js
    if hasattr(js, 'highlightBlockInIDE'):
        try:
            js.highlightBlockInIDE(str(block_id))
        except Exception:
            pass
    if not getattr(sys.modules.get('js', None), '_kmv_sim_running', True):
        raise KeyboardInterrupt("SIM_STOPPED")

async def _kmv_user_main():
${userBody}

async def _kmv_runner_wrapper():
    try:
        await _kmv_user_main()
        # สำหรับโปรแกรมที่ไม่มีลูป ให้หน่วงเวลาแสดงผลบน Simulator สักครู่ก่อนสิ้นสุด
        await asyncio.sleep(0.5)
    except KeyboardInterrupt:
        pass
    except Exception as _kmv_err:
        print(f"[KMV Sim Error] {_kmv_err}")
        raise _kmv_err
    finally:
        import js
        if hasattr(js, '_kmv_on_finish'):
            js._kmv_on_finish()
`

  return mockHeader + "\nawait _kmv_runner_wrapper()\n"
}

// 5. ฟังก์ชันลงทะเบียน Callback และ Flush ค่าล่าสุดใน Cache
export const registerPinCallback = callback => {
  currentPinCallback = callback

  // พ่นค่าสถานะล่าสุดทั้งหมดที่มีใน Cache ให้ Vue ทันทีที่เปิดหน้าจอ
  Object.keys(pinStates).forEach(pin => {
    if (currentPinCallback) {
      currentPinCallback(pin, pinStates[pin])
    }
  })
}

// ตารางจับคู่ชื่อ Pin ระหว่าง Unity, Blockly, และฮาร์ดแวร์จริงของแต่ละบอร์ด
const PIN_MAP = {
  // kidbright-mai (Block: Read Pin ใช้ dropdown PH14..PH0 ซึ่งมี value เป็น 14..0)
  'PH14': ['PH14', '14', 'D2'],
  '14': ['PH14', '14', 'D2'],
  'PH13': ['PH13', '13', 'D1'],
  '13': ['PH13', '13', 'D1'],
  'PH8': ['PH8', '8'],
  '8': ['PH8', '8'],
  'PH7': ['PH7', '7'],
  '7': ['PH7', '7'],
  'PH6': ['PH6', '6'],
  '6': ['PH6', '6'],
  'PH3': ['PH3', '3'],
  '3': ['PH3', '3'],
  'PH2': ['PH2', '2'],
  '2': ['PH2', '2'],
  'PH1': ['PH1', '1'],
  '1': ['PH1', '1'],
  'PH0': ['PH0', '0'],
  '0': ['PH0', '0'],

  // kidbright-mai-plus (Block: Read/Write Pin ใช้ dropdown IO2..IO8 ซึ่งมี value เป็น A23, A27, ...)
  'IO2': ['IO2', 'A23', '23', '2'],
  'A23': ['IO2', 'A23', '23', '2'],
  'IO3': ['IO3', 'A27', '27', '3'],
  'A27': ['IO3', 'A27', '27', '3'],
  'IO4': ['IO4', 'A25', '25', '4'],
  'A25': ['IO4', 'A25', '25', '4'],
  'IO5': ['IO5', 'A22', '22', '5'],
  'A22': ['IO5', 'A22', '22', '5'],
  'IO6': ['IO6', 'A24', '24', '6'],
  'A24': ['IO6', 'A24', '24', '6'],
  'IO7': ['IO7', 'P24', '7'],
  'P24': ['IO7', 'P24', '7'],
  'IO8': ['IO8', 'A15', '15', '8'],
  'A15': ['IO8', 'A15', '15', '8'],
  'IO9': ['IO9', 'A17', '17', '9'],
  'A17': ['IO9', 'A17', '17', '9'],
  'IO10': ['IO10', 'A14', '10'],
  'A14': ['IO10', 'A14', '10'],

  // kidbright-mai-plus pin_digital_read (D0..D6)
  'D0': ['D0', '26'],
  '26': ['D0', '26'],
  'D1': ['D1', '13', 'PH13'],
  'D2': ['D2', '14', 'PH14'],
  'D3': ['D3', '15'],
  '15': ['D3', '15'],
  'D4': ['D4', '27'],
  '27': ['D4', '27'],
  'D5': ['D5', '32'],
  '32': ['D5', '32'],
  'D6': ['D6', '33'],
  '33': ['D6', '33'],

  // Camera state
  'DISPLAY_CAMERA': ['DISPLAY_CAMERA', 'CAMERA'],
  'CAMERA': ['DISPLAY_CAMERA', 'CAMERA'],

  // Draw text state
  'DRAW_TEXT': ['DRAW_TEXT', 'DISPLAY_DRAW_TEXT'],
  'DISPLAY_DRAW_TEXT': ['DRAW_TEXT', 'DISPLAY_DRAW_TEXT'],
}

// 6. ฟังก์ชันอ่านและเขียนค่า Pin / Switch สำหรับติดต่อกับ Simulator
export const writePinToKMV = (pin, val) => {
  if (pin === undefined || val === undefined) {
    console.warn("[Bridge Warning] Invalid data received:", pin, val)

    return
  }

  const strPin = String(pin).trim()
  const upperPin = strPin.toUpperCase()
  let strVal
  if (val === true || String(val).toLowerCase() === 'true') {
    strVal = '1'
  } else if (val === false || String(val).toLowerCase() === 'false') {
    strVal = '0'
  } else {
    strVal = String(val).trim()
  }

  console.log(`[Bridge Received] Pin: ${strPin}, Val: ${strVal}`)
  pinStates[strPin] = strVal
  pinStates[upperPin] = strVal
  pinStates[strPin.toLowerCase()] = strVal

  // อัปเดตทุก Alias ใน PIN_MAP
  const aliases = PIN_MAP[upperPin] || PIN_MAP[strPin]
  if (aliases) {
    aliases.forEach(alias => {
      pinStates[alias] = strVal
      pinStates[alias.toUpperCase()] = strVal
      pinStates[alias.toLowerCase()] = strVal
    })
  }

  // Trigger Web Audio Buzzer if pin is BUZZER (from kbide-simulator sound concept)
  if (strPin.toUpperCase() === 'BUZZER') {
    if (strVal === '1' || strVal.toLowerCase() === 'true') {
      buzzerSynth.playTone(1000)
    } else if (strVal === '0' || strVal.toLowerCase() === 'false') {
      buzzerSynth.stopTone()
    } else {
      const freq = Number(strVal)
      if (!isNaN(freq) && freq > 0) {
        buzzerSynth.playTone(freq)
      }
    }
  }

  // รองรับ mapping ชื่อ Pin เช่น "14" <-> "PH14", "2" <-> "IO2"
  if (/^\d+$/.test(strPin)) {
    pinStates['PH' + strPin] = strVal
    pinStates['IO' + strPin] = strVal
  } else if (upperPin.startsWith('PH') || upperPin.startsWith('IO')) {
    const rawNum = strPin.slice(2)
    pinStates[rawNum] = strVal
    pinStates['PH' + rawNum] = strVal
    pinStates['IO' + rawNum] = strVal
  }

  if (currentPinCallback) {
    currentPinCallback(strPin, strVal)
    // ส่ง Alias เพิ่มเติมให้ Controller เช่น ถ้าเขียน A23 ให้ส่ง IO2 ไปด้วย
    if (aliases) {
      aliases.forEach(alias => {
        if (alias !== strPin && alias !== upperPin) {
          currentPinCallback(alias, strVal)
        }
      })
    }
  }
}

// ฟังก์ชันรับค่า Input Sensor จาก Unity ที่ส่งผ่าน SensorInput(pin, value)
export const setPinFromKMV = (pin, val) => {
  if (pin === undefined) {
    console.warn("[Simulator] setPinFromKMV received undefined pin")
    return
  }

  // 1. รองรับกรณีส่งเข้ามาเป็น Object ชุดหลายพินพร้อมค่า เช่น { PH14: 1, PH13: 0, PH8: 1 }
  if (typeof pin === 'object' && !Array.isArray(pin) && val === undefined) {
    for (const k in pin) {
      if (Object.prototype.hasOwnProperty.call(pin, k)) {
        setPinFromKMV(k, pin[k])
      }
    }
    return
  }

  // 2. รองรับกรณีส่งหลายพินเป็น Array เช่น ["PH14", "PH13"], 1
  if (Array.isArray(pin)) {
    for (const p of pin) {
      setPinFromKMV(p, val)
    }
    return
  }

  // 3. รองรับกรณีส่งหลายพินคั่นด้วยเครื่องหมายจุลภาค เช่น "PH14,PH13", 1
  if (typeof pin === 'string' && pin.includes(',')) {
    const parts = pin.split(',')
    for (const p of parts) {
      const pName = p.trim()
      if (pName) setPinFromKMV(pName, val)
    }
    return
  }

  if (val === undefined) {
    console.warn("[Simulator] setPinFromKMV received undefined value for pin:", pin)
    return
  }

  const strPin = String(pin).trim()
  const upperPin = strPin.toUpperCase()
  const numVal = (val === 1 || val === '1' || val === true || String(val).toLowerCase() === 'true') ? 1 : 0

  pinStates[strPin] = numVal
  pinStates[upperPin] = numVal
  pinStates[strPin.toLowerCase()] = numVal

  const aliases = PIN_MAP[upperPin] || PIN_MAP[strPin]
  if (aliases) {
    aliases.forEach(alias => {
      pinStates[alias] = numVal
      pinStates[alias.toUpperCase()] = numVal
      pinStates[alias.toLowerCase()] = numVal
    })
  }

  if (/^\d+$/.test(strPin)) {
    pinStates['PH' + strPin] = numVal
    pinStates['IO' + strPin] = numVal
  } else if (upperPin.startsWith('PH') || upperPin.startsWith('IO')) {
    const rawNum = strPin.slice(2)
    pinStates[rawNum] = numVal
    pinStates['PH' + rawNum] = numVal
    pinStates['IO' + rawNum] = numVal
  }

  console.log(`[Simulator Bridge] Sensor input updated: pin=${strPin} (${upperPin}) -> ${numVal}`)

  if (currentPinCallback) {
    currentPinCallback(strPin, numVal)
  }
}

export const getPinFromKMV = pin => {
  const strPin = String(pin).trim()
  const upperPin = strPin.toUpperCase()

  if (pinStates[strPin] !== undefined) return Number(pinStates[strPin])
  if (pinStates[upperPin] !== undefined) return Number(pinStates[upperPin])
  if (pinStates[strPin.toLowerCase()] !== undefined) return Number(pinStates[strPin.toLowerCase()])

  const aliases = PIN_MAP[upperPin] || PIN_MAP[strPin]
  if (aliases) {
    for (const alias of aliases) {
      if (pinStates[alias] !== undefined) return Number(pinStates[alias])
      if (pinStates[alias.toUpperCase()] !== undefined) return Number(pinStates[alias.toUpperCase()])
      if (pinStates[alias.toLowerCase()] !== undefined) return Number(pinStates[alias.toLowerCase()])
    }
  }

  if (/^\d+$/.test(strPin)) {
    if (pinStates['PH' + strPin] !== undefined) return Number(pinStates['PH' + strPin])
    if (pinStates['IO' + strPin] !== undefined) return Number(pinStates['IO' + strPin])
  } else if (upperPin.startsWith('PH') || upperPin.startsWith('IO')) {
    const rawNum = strPin.slice(2)
    if (pinStates[rawNum] !== undefined) return Number(pinStates[rawNum])
  }

  // 1. Fallback อ่านจาก DOM ใน iframe ถ้ามี
  if (typeof document !== 'undefined') {
    const iframe = document.querySelector('iframe')
    if (iframe?.contentDocument) {
      const pinEl = iframe.contentDocument.getElementById('PIN')
      const pinValEl = iframe.contentDocument.getElementById('PIN_val')
      if (pinEl && pinValEl) {
        const domPin = (pinEl.innerText?.trim() || pinEl.innerHTML?.trim() || '').toUpperCase()
        if (domPin === upperPin || (aliases && aliases.map(a => a.toUpperCase()).includes(domPin))) {
          const v = pinValEl.innerText?.trim() || pinValEl.innerHTML?.trim()
          return (v === '1' || v === 1) ? 1 : 0
        }
      }

      const specEl = iframe.contentDocument.getElementById('PIN_' + upperPin) || iframe.contentDocument.getElementById('PIN_' + strPin)
      if (specEl) {
        const v = specEl.innerText?.trim() || specEl.innerHTML?.trim()
        return (v === '1' || v === 1) ? 1 : 0
      }
    }
  }

  return 0
}

export const getSwitchFromKMV = sw => {
  // 1. อ่านจาก iframe ของ Simulator ถ้ามี DOM Element
  if (typeof document !== 'undefined') {
    const iframe = document.querySelector('iframe')
    if (iframe?.contentDocument) {
      const id = sw === 'S1' ? 'Switch_1' : 'Switch_2'
      const el = iframe.contentDocument.getElementById(id)
      if (el) {
        const text = el.innerText?.trim() || el.innerHTML?.trim()

        return text === '1'
      }
    }
  }

  // 2. อ่านจาก Cache ถ้ามี
  return Boolean(switchStates[sw])
}

export const setSwitchFromKMV = (sw, val) => {
  switchStates[sw] = Boolean(val)
}

// 7. ผูกเข้ากับ Global Window Scope สำหรับ Python และ Simulator Controller
if (typeof window !== 'undefined') {
  window.highlightBlockInIDE = highlightBlockInIDE
  window.writePinToKMV = writePinToKMV
  window.getPinFromKMV = getPinFromKMV
  window.setPinFromKMV = setPinFromKMV
  window.SensorInput = setPinFromKMV
  window.getSwitchFromKMV = getSwitchFromKMV
  window.setSwitchFromKMV = setSwitchFromKMV
  window._kmv_step_hook = _kmv_step_hook
  window._kmv_on_finish = onSimulatorFinish
  window.pauseSimulator = pauseSimulator
  window.resumeSimulator = resumeSimulator
  window.stepSimulator = stepSimulator
  window.stopSimulator = stopSimulatorPython
  window.runSimulatorPython = runSimulatorPython
  window.setSimulatorSpeed = setSimulatorSpeed
}

//simulator edit (end)