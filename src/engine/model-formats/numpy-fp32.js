import ModelFormat from "./base.js"

/**
 * Numpy fp32 format — single file:
 *   model_cpu.npz    (all VoiceCNN weights + labels; hash source)
 *
 * Used by kidbright-mai (V831) for voice classification. The board
 * runs forward in numpy fp32 on the A7 CPU via voice_cpu_infer.py
 * because AWNN int8 per-tensor quantization collapses small-vocab
 * voice models regardless of training and calibration.
 */
export default class NumpyFp32 extends ModelFormat {
  static id = "numpy-fp32"
  static files = [
    { role: "primary", ext: "npz", serverFilename: "model_cpu.npz" },
  ]
}
