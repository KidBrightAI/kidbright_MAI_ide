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
 * The order of checks encodes the product matrix: kidbright-mai (V831)
 * uses cpu numpy for voice and ncnn-int8 for everything else; mai-plus
 * uses cvimodel for image+yolo but still ncnn-int8 for voice (legacy,
 * AWNN on CV181x is fine for some voice scenarios).
 */
export function pickFor({ projectType, boardId, modelType } = {}) {
  if (boardId === "kidbright-mai-plus") {
    if (projectType === "VOICE_CLASSIFICATION") return NcnnInt8
    return Cvimodel
  }
  // default / kidbright-mai (V831)
  if (projectType === "VOICE_CLASSIFICATION") return NumpyFp32
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
