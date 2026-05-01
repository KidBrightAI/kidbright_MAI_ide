import ModelFormat from "./base.js"

/**
 * Numpy fp32 format — single file:
 *   model_cpu.npz    (all VoiceCNN weights + labels; hash source)
 *
 * Used by both boards for voice classification:
 *   - kidbright-mai (V831): forward in numpy on A7 via voice_cpu_infer.py
 *   - kidbright-mai-plus (CV181x): forward in numpy on A53 via voice_runtime.py
 * INT8 per-tensor quantization collapses small-vocab voice models on either
 * NPU regardless of training and calibration, so we run on CPU on both boards.
 */
export default class NumpyFp32 extends ModelFormat {
  static id = "numpy-fp32"
  static files = [
    { role: "primary", ext: "npz", serverFilename: "model_cpu.npz" },
  ]
}
