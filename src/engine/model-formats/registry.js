import { ALL_FORMATS } from "./base.js"
import NcnnInt8 from "./ncnn-int8.js"
import Cvimodel from "./cvimodel.js"
import NumpyFp32 from "./numpy-fp32.js"

// Register every format class here so base.removeStaleFS sees every ext.
ALL_FORMATS.push(NcnnInt8, Cvimodel, NumpyFp32)

/**
 * Pick the right format for a project that's being converted / deployed.
 *
 *   { projectType, boardId, modelType } -> ModelFormat class
 *
 * The product matrix:
 *   - kidbright-mai (V831): ncnn-int8 for image+yolo, numpy-fp32 for voice.
 *     V831's AWNN INT8 collapses the tiny voice classifier head regardless of
 *     calibration, so voice runs on the A7 CPU via numpy.
 *   - kidbright-mai-plus (CV181x): cvimodel for everything including voice.
 *     The CV181x NPU + tpu-mlir handle the small voice classifier fine, and
 *     CPU numpy on the single-core RISC-V is ~3000× slower than the NPU.
 */
export function pickFor({ projectType, boardId, modelType } = {}) {
  if (projectType === "VOICE_CLASSIFICATION") {
    return boardId === "kidbright-mai-plus" ? Cvimodel : NumpyFp32
  }
  if (boardId === "kidbright-mai-plus") return Cvimodel
  // default / kidbright-mai (V831)
  return NcnnInt8
}

/**
 * Resolve by persisted `workspaceStore.model.type` when projectType +
 * boardId aren't easily reachable (e.g. uploadModelIfNeeded sees only
 * the stored model record). Uses the primary extension as the tag.
 */
export function pickByType(typeTag) {
  for (const F of ALL_FORMATS) {
    if (F.typeTag === typeTag) return F
  }
  // Back-compat default: treat unknown tag as ncnn-int8.
  return NcnnInt8
}

export { NcnnInt8, Cvimodel, NumpyFp32 }
