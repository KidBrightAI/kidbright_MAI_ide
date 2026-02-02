import JSZip from "jszip"
import ObjectDetectionStrategy from "@/engine/project-strategies/ObjectDetectionStrategy"
import ImageClassificationStrategy from "@/engine/project-strategies/ImageClassificationStrategy"
import VoiceClassificationStrategy from "@/engine/project-strategies/VoiceClassificationStrategy"

export default class ProjectIOService {
  constructor(fs) {
    this.fs = fs
    this.strategies = {
      "OBJECT_DETECTION": new ObjectDetectionStrategy(fs),
      "IMAGE_CLASSIFICATION": new ImageClassificationStrategy(fs),
      "VOICE_CLASSIFICATION": new VoiceClassificationStrategy(fs),
    }
  }

  getStrategy(projectType) {
    return this.strategies[projectType]
  }

  async saveProject(workspaceState, datasetStore, filename, mode = 'download') {
    console.log("saving project via service")
    let zip = new JSZip()

    // Save Project State
    zip.file("project.json", JSON.stringify({
      ...workspaceState,

      // plugin: pluginInstalled // Passed in state? or handled externally? 
      // workspace.js: plugin: usePluginStore().installed
      // We should probably pass the full object necessary or handle it in caller.
      // For now, assume workspaceState contains everything needed OR caller handles modification.
    }))

    // Save Dataset Meta
    zip.file("dataset.json", JSON.stringify({
      project: datasetStore.project,
      datasetType: datasetStore.datasetType,
      data: datasetStore.data,
      baseURL: datasetStore.baseURL,
    }))

    // Delegate to Strategy
    const strategy = this.getStrategy(workspaceState.projectType)
    if (strategy) {
      await strategy.save(zip, datasetStore, workspaceState)
    } else {
      // Fallback for simple projects or error?
      // Old logic didn't break if no type, just didn't save specific dataset files.
      // But it DID loop through datasets.
      // If type is null (e.g. Block mode only), we might still want to save images?
      // Current workspace.js logic:
      // if (projectType == X) ... else if (Y) ...
      // AND THEN loop datasets.
      // But if projectType is NULL, the loops inside if/else don't run.
      // BUT lines 119-155 in original workspace.js save files regardless?
      // Ah, lines 122 check projectType again.
      // So if projectType is null, it loops but does nothing except update progress?
      // No, line 120 gets filename.
      // Line 122 checks.
      // So yes, if projectType is unknown, it pretty much does nothing with files.
    }

    // Save Model
    if (workspaceState.model) {
      let modelFolder = zip.folder("model")
      try {
        // Note: workspace.js used storage.readAsFile(this.$fs, ...)
        // Helper:
        let modelBinaries = await this.fs.readAsFile(`${workspaceState.id}/model.bin`)
        let modelParams = await this.fs.readAsFile(`${workspaceState.id}/model.param`)
        modelFolder.file("model.bin", modelBinaries)
        modelFolder.file("model.param", modelParams)
      } catch (e) {
        console.warn("Model files not found for saving", e)
      }
    }

    // Generate Zip
    let zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "STORE",
    })

    if (mode === 'download') {
      filename = filename.endsWith(".zip") ? filename : filename + ".zip"
      this.downloadBlob(filename, zipBlob)
      
      return true
    } else {
      return zipBlob
    }
  }

  async loadProjectZip(zipData, workspaceStore, datasetStore) {
    let zip = new JSZip()
    await zip.loadAsync(zipData)

    let projectData = await zip.file("project.json").async("string")
    projectData = JSON.parse(projectData)

    // Clean old data
    try {
      if (projectData.id) await this.fs.removeFolder(projectData.id)
      if (workspaceStore.id) await this.fs.removeFolder(workspaceStore.id)
    } catch (e) {
      console.log("Cleanup error (normal if new)", e)
    }

    // Load Dataset Meta
    let entry = await datasetStore.prepareDataset(projectData.id)
    let datasetData = await zip.file("dataset.json").async("string")
    datasetData = JSON.parse(datasetData)

    // Delegate to Strategy
    const strategy = this.getStrategy(projectData.projectType)
    if (strategy) {
      await strategy.load(zip, projectData, datasetStore, datasetData)
    }

    // Load Model
    if (projectData.model) {
      let model = await zip.folder("model")
      if (model) {
        let modelBinaries = await model.file("model.bin").async("blob")
        let modelParams = await model.file("model.param").async("blob")
        await this.fs.writeFile(`${projectData.id}/model.bin`, modelBinaries)
        await this.fs.writeFile(`${projectData.id}/model.param`, modelParams)
      }
    }

    return { projectData, datasetData, entry }
  }

  downloadBlob(filename, data) {
    var a = document.createElement("a")
    document.body.appendChild(a)
    a.style = "display: none"
    let url = window.URL.createObjectURL(data)
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }
}
