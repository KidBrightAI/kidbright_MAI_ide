import ModelFormat from "./base.js"

/**
 * NCNN int8 format — two files:
 *   model_int8.bin     (weights; hash source)
 *   model_int8.param   (network topology)
 *
 * Used by kidbright-mai (V831) for image classification and YOLO via the
 * AWNN runtime. Voice on both V831 and CV181x goes to numpy-fp32 — INT8
 * quantization collapses small-vocab voice models regardless of board.
 */
export default class NcnnInt8 extends ModelFormat {
  static id = "ncnn-int8"
  static files = [
    { role: "primary", ext: "bin", serverFilename: "model_int8.bin" },
    { role: "param", ext: "param", serverFilename: "model_int8.param" },
  ]
}
