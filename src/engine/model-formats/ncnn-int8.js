import ModelFormat from "./base.js"

/**
 * NCNN int8 format — two files:
 *   model_int8.bin     (weights; hash source)
 *   model_int8.param   (network topology)
 *
 * Used by:
 *   - kidbright-mai (V831) for image classification and YOLO (AWNN runtime)
 *   - kidbright-mai-plus for voice classification (also AWNN on CV181x)
 *
 * NOT used for V831 voice — that went to numpy-fp32.
 */
export default class NcnnInt8 extends ModelFormat {
  static id = "ncnn-int8"
  static files = [
    { role: "primary", ext: "bin", serverFilename: "model_int8.bin" },
    { role: "param", ext: "param", serverFilename: "model_int8.param" },
  ]
}
