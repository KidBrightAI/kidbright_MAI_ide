export default class BaseProjectStrategy {
  constructor(fs) {
    this.fs = fs
  }

  /**
   * @param {JSZip} zip 
   * @param {Object} datasetStore 
   * @param {Object} projectConfig 
   */
  async save(zip, datasetStore, projectConfig) {
    throw new Error("Method 'save' must be implemented.")
  }

  /**
   * @param {JSZip} zip 
   * @param {Object} projectData 
   * @param {Object} datasetStore 
   */
  async load(zip, projectData, datasetStore) {
    throw new Error("Method 'load' must be implemented.")
  }

  /**
   * Helper to read file as blob from zip
   */
  async getZipFile(zip, path) {
    return await zip.file(path).async("blob")
  }

  /**
   * Helper to read file as string from zip
   */
  async getZipString(zip, path) {
    return await zip.file(path).async("string")
  }
}
