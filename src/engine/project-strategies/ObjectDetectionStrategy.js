import BaseProjectStrategy from "./BaseProjectStrategy"
import { generatePascalVocFromDataset } from "@/engine/helper"

export default class ObjectDetectionStrategy extends BaseProjectStrategy {
  async save(zip, datasetStore, projectConfig) {
    const rawDataset = zip.folder("dataset")
    const annotations = rawDataset.folder("Annotations")
    const images = rawDataset.folder("JPEGImages")
    const imageSets = rawDataset.folder("ImageSets")
    const main = imageSets.folder("Main")

    const datasets = datasetStore.data
    const allImageFile = datasets.map(data => data.id)

    // Split Train/Val
    const splitConstant = (projectConfig.trainConfig?.train_split / 100) || 0.8
    const splitSite = Math.round(allImageFile.length * splitConstant)

    // Shuffle
    // Note: Mutating the array clone
    const shuffledFiles = [...allImageFile].sort(() => Math.random() - 0.5)
    const trainFile = shuffledFiles.slice(0, splitSite)
    const validFile = shuffledFiles.slice(splitSite)

    main.file("train.txt", trainFile.join("\n"))
    main.file("val.txt", validFile.join("\n"))

    for (const data of datasets) {
      const filename = `${data.id}.${data.ext}`
      const fileData = await datasetStore.getDataAsFile(filename)

      // XML VOC export
      const xml = generatePascalVocFromDataset(data)
      annotations.file(`${data.id}.xml`, xml)
      images.file(filename, fileData)
    }
  }

  async load(zip, projectData, datasetStore, datasetData) {
    const total = datasetData.data.length
    let processed = 0

    for (let i = 0; i < total; i++) {
      const data = datasetData.data[i]

      // Read XML
      const xml = await this.getZipString(zip, `dataset/Annotations/${data.id}.xml`)

      // Parse XML
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xml, "text/xml")
      const objects = xmlDoc.getElementsByTagName("object")
      const dataset = []

      for (let j = 0; j < objects.length; j++) {
        const object = objects[j]
        const bndbox = object.getElementsByTagName("bndbox")[0]
        dataset.push({
          id: data.id,
          class: object.getElementsByTagName("name")[0].innerHTML,
          xmin: bndbox.getElementsByTagName("xmin")[0].innerHTML,
          ymin: bndbox.getElementsByTagName("ymin")[0].innerHTML,
          xmax: bndbox.getElementsByTagName("xmax")[0].innerHTML,
          ymax: bndbox.getElementsByTagName("ymax")[0].innerHTML,
        })
      }

      // Update Store
      datasetStore.data = datasetStore.data.concat(dataset)

      // Save Image
      const fileData = await this.getZipFile(zip, `dataset/JPEGImages/${data.id}.${data.ext}`)
      await this.fs.writeFile(`${projectData.id}/${data.id}.${data.ext}`, fileData)

      processed++
    }
    
    return processed
  }
}
