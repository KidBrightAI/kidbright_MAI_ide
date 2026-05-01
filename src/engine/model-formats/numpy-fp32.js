import ModelFormat from "./base.js"

/**
 * Numpy fp32 format — single file:
 *   model_cpu.npz    (all VoiceCNN weights + labels; hash source)
 *
 * Used by kidbright-mai (V831) for voice classification — V831's AWNN INT8
 * collapses the tiny voice classifier head regardless of calibration, so
 * voice runs on the A7 CPU via voice_cpu_infer.py with numpy fp32.
 * (kidbright-mai-plus uses cvimodel + the CV181x NPU instead — see
 * cvimodel.js. The CV181x quantizer handles the small voice head fine and
 * NPU forward is ~3000× faster than numpy on the single-core RISC-V.)
 */
export default class NumpyFp32 extends ModelFormat {
  static id = "numpy-fp32"
  static files = [
    { role: "primary", ext: "npz", serverFilename: "model_cpu.npz" },
  ]
}
