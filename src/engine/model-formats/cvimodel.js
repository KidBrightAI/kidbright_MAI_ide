import ModelFormat from "./base.js"

/**
 * Sophgo CVITEK cvimodel format — two files:
 *   model.cvimodel   (quantized weights; hash source)
 *   model.mud        (model metadata / config, plain text ini-ish)
 *
 * Used by kidbright-mai-plus (MaixCAM CV181x) for image classification
 * and YOLO via the tpu-mlir toolchain.
 *
 * The .mud file embeds a `model = <filename>.cvimodel` line that must be
 * rewritten at upload time to reference this model's hashed filename on
 * the board (so `nn.Classifier/YOLO11(model=<path>.mud)` can find the
 * bin next to it).
 */
export default class Cvimodel extends ModelFormat {
  static id = "cvimodel"
  static files = [
    { role: "primary", ext: "cvimodel", serverFilename: "model.cvimodel" },
    { role: "param", ext: "mud", serverFilename: "model.mud" },
  ]

  static async maybeTransform(role, blob, hash) {
    if (role !== "param") return blob
    const text = await blob.text()
    const patched = text.replace(/model\s*=\s*[^\r\n]+/g, `model = ${hash}.cvimodel`)
    return new Blob([patched], { type: blob.type || "text/plain" })
  }
}
