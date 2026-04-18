import { md5 } from "hash-wasm"
import { BOARD_MODEL_DIR } from "@/engine/board-paths"

/**
 * Base class for a model "file format" — i.e. the concrete set of files
 * that make up a trained model on the Colab server, in browser storage,
 * in the project zip, and on the board.
 *
 * A subclass declares its file list once (static `files`) and inherits
 * download / save-to-FS / upload / zip / hash behaviour. The whole point
 * of having this abstraction is that adding a new format = one new file
 * in this folder, not changes across server.js / workspace.js / the two
 * protocols / ProjectIOService.
 *
 * `role: 'primary'` is always the file whose md5 becomes `model.hash`
 * and whose extension goes into `model.type`. Secondary files (e.g.
 * `.param` alongside `.bin`) are listed after it.
 */
export default class ModelFormat {
  /** stable identifier used in logs / internals. */
  static id = "base"

  /** remote directory on the board — shared via @/engine/board-paths. */
  static remoteDir = BOARD_MODEL_DIR

  /**
   * static list of files making up this format. Subclasses must override.
   * Each entry: { role, ext, serverFilename }
   *   role         - 'primary' (hash source) or any secondary label
   *   ext          - on-board/in-browser filename extension
   *   serverFilename - name the Colab server writes under output/
   */
  static files = []

  /** `workspaceStore.model.type` tag (usually the primary file's extension). */
  static get typeTag() {
    const primary = this.files.find(f => f.role === "primary")
    return primary ? primary.ext : this.id
  }

  // ---------------------------------------------------------------- download

  /**
   * GET each file from the Colab server into a Blob.
   *   returns {[role]: Blob}
   * `axios` is passed in so we don't import it here — keeps the module
   * framework-agnostic + testable.
   */
  static async download(axios, serverUrl, projectId, onProgress) {
    const blobs = {}
    for (const f of this.files) {
      const resp = await axios.get(
        `${serverUrl}/projects/${projectId}/output/${f.serverFilename}`,
        {
          responseType: "blob",
          onDownloadProgress: onProgress,
        },
      )
      blobs[f.role] = resp.data
    }
    return blobs
  }

  // ------------------------------------------------------------- browser FS

  /**
   * Clears any previous model files for this project from browser FS —
   * across all known extensions, so switching formats leaves no stragglers.
   */
  static async removeStaleFS(fs, projectId) {
    const staleExts = new Set()
    for (const FormatCls of ALL_FORMATS) {
      for (const f of FormatCls.files) staleExts.add(f.ext)
    }
    for (const ext of staleExts) {
      try {
        await fs.removeFile(`${projectId}/model.${ext}`)
      } catch (e) { /* not present — fine */ }
    }
  }

  static async saveToFS(fs, projectId, blobs) {
    await this.removeStaleFS(fs, projectId)
    for (const f of this.files) {
      const blob = blobs[f.role]
      if (!blob) throw new Error(`${this.id}: missing blob for role '${f.role}'`)
      await fs.writeFile(`${projectId}/model.${f.ext}`, new Blob([blob]))
    }
  }

  static async readFromFS(fs, projectId) {
    const blobs = {}
    for (const f of this.files) {
      blobs[f.role] = await fs.readAsFile(`${projectId}/model.${f.ext}`)
    }
    return blobs
  }

  // ----------------------------------------------------------------- upload

  /**
   * Transport-agnostic upload.
   *   writeFile(remotePath, blob) => Promise
   *   statFile(remotePath)         => Promise<{exists, size}>
   * The format decides what filenames + content go to the board. Each
   * protocol supplies `writeFile` and `statFile` that speak its transport.
   */
  static async uploadToBoard({ writeFile, statFile }, hash, blobs, { force = false } = {}) {
    for (const f of this.files) {
      const remotePath = `${this.remoteDir}/${hash}.${f.ext}`
      let blob = blobs[f.role]
      blob = await this.maybeTransform(f.role, blob, hash)
      // size-based skip if the file is already present unchanged
      if (!force && statFile) {
        try {
          const s = await statFile(remotePath)
          if (s && s.exists && s.size === blob.size) continue
        } catch (e) { /* stat failed — treat as "not present" */ }
      }
      await writeFile(remotePath, blob)
    }
  }

  /**
   * Hook for per-format payload rewriting (e.g. cvimodel's .mud file has
   * to have its `model =` line updated to reference this hash). Default
   * passes blobs through unchanged.
   */
  static async maybeTransform(role, blob, hash) {
    return blob
  }

  // ----------------------------------------------------------------- zip IO

  static async packInZip(zip, fs, projectId) {
    const folder = zip.folder("model")
    for (const f of this.files) {
      const blob = await fs.readAsFile(`${projectId}/model.${f.ext}`)
      folder.file(`model.${f.ext}`, blob)
    }
  }

  static async loadFromZip(zip, projectId, fs) {
    const folder = zip.folder("model")
    for (const f of this.files) {
      const entry = folder.file(`model.${f.ext}`)
      if (!entry) throw new Error(`${this.id}: missing model.${f.ext} in zip`)
      const blob = await entry.async("blob")
      await fs.writeFile(`${projectId}/model.${f.ext}`, blob)
    }
  }

  // ------------------------------------------------------------------ hash

  /** md5 of the primary blob = model.hash + on-board filename prefix. */
  static async computeHash(blobs) {
    const primary = blobs.primary
    if (!primary) throw new Error(`${this.id}: no primary blob for hash`)
    const bytes = new Uint8Array(await primary.arrayBuffer())
    return await md5(bytes)
  }
}

// Populated by registry.js at module init so `removeStaleFS` can see every
// known extension. Using a late-bound array avoids a circular import.
export const ALL_FORMATS = []
