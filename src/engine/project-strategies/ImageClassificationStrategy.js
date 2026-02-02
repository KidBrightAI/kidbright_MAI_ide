import BaseProjectStrategy from "./BaseProjectStrategy"

export default class ImageClassificationStrategy extends BaseProjectStrategy {
  async save(zip, datasetStore, projectConfig) {
    const rawDataset = zip.folder("dataset")
    const datasets = datasetStore.data

    for (const data of datasets) {
      const filename = `${data.id}.${data.ext}`
      const fileData = await datasetStore.getDataAsFile(filename)

      // Store image in class folder
      rawDataset.file(`${data.class}/${filename}`, fileData)
    }
  }

  async load(zip, projectData, datasetStore, datasetData) {
    const total = datasetData.data.length
    let processed = 0

    for (let i = 0; i < total; i++) {
      const data = datasetData.data[i]
      const fileData = await this.getZipFile(zip, `dataset/${data.class}/${data.id}.${data.ext}`)

      await this.fs.writeFile(`${projectData.id}/${data.id}.${data.ext}`, fileData)
      processed++
    }
    
    return processed
  }
}
