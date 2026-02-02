import BaseProjectStrategy from "./BaseProjectStrategy"

export default class VoiceClassificationStrategy extends BaseProjectStrategy {
  async save(zip, datasetStore, projectConfig) {
    const rawDataset = zip.folder("dataset")
    const waveform = rawDataset.folder("waveform")
    const mfcc = rawDataset.folder("mfcc")
    const sound = rawDataset.folder("sound")

    const datasets = datasetStore.data

    for (const data of datasets) {
      const filename = `${data.id}.${data.ext}`
      const fileData = await datasetStore.getDataAsFile(filename)

      waveform.file(`${data.class}/${filename}`, fileData)

      if (data.sound && data.sound_ext) {
        const soundFilename = `${data.id}.${data.sound_ext}`
        const soundFile = await datasetStore.getDataAsFile(soundFilename)
        sound.file(`${data.class}/${soundFilename}`, soundFile)
      }

      if (data.mfcc && data.mfcc_ext) {
        const mfccFilename = `${data.id}_mfcc.${data.mfcc_ext}`
        const mfccFile = await datasetStore.getDataAsFile(mfccFilename)
        mfcc.file(`${data.class}/${mfccFilename}`, mfccFile)
      }
    }
  }

  async load(zip, projectData, datasetStore, datasetData) {
    const total = datasetData.data.length
    let processed = 0

    for (let i = 0; i < total; i++) {
      const data = datasetData.data[i]

      // Waveform
      const fileData = await this.getZipFile(zip, `dataset/waveform/${data.class}/${data.id}.${data.ext}`)
      await this.fs.writeFile(`${projectData.id}/${data.id}.${data.ext}`, fileData)

      // Sound
      if (data.sound && data.sound_ext) {
        const soundFile = await this.getZipFile(zip, `dataset/sound/${data.class}/${data.id}.${data.sound_ext}`)
        await this.fs.writeFile(`${projectData.id}/${data.id}.${data.sound_ext}`, soundFile)
      }

      // MFCC
      if (data.mfcc && data.mfcc_ext) {
        const mfccFile = await this.getZipFile(zip, `dataset/mfcc/${data.class}/${data.id}_mfcc.${data.mfcc_ext}`)
        await this.fs.writeFile(`${projectData.id}/${data.id}_mfcc.${data.mfcc_ext}`, mfccFile)
      }
      processed++
    }
    
    return processed
  }
}
