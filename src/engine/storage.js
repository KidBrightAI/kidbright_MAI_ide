/* eslint-disable no-undef */
import { toast } from "vue3-toastify"

export default class StorageService {
  constructor() {
    this.fs = null
    this.targetBytes = 1024 * 1024 * 800 // 800MB
    this.type = window.PERSISTENT // Default to PERSISTENT
  }

  async init() {
    return new Promise((resolve, reject) => {
      window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem
      
      const onSuccess = fs => {
        console.log("File system initialized")
        this.fs = fs
        resolve(this)
      }

      const onError = err => {
        console.error("File system initialization failed", err)
        toast.error("Failed to initialize storage.")
        reject(err)
      }

      if (this.type === window.TEMPORARY) {
        window.requestFileSystem(window.TEMPORARY, this.targetBytes, onSuccess, onError)
      } else {
        if (navigator.webkitPersistentStorage) {
          navigator.webkitPersistentStorage.requestQuota(
            this.targetBytes,
            grantedBytes => {
              window.requestFileSystem(window.PERSISTENT, grantedBytes, onSuccess, onError)
            },
            onError,
          )
        } else if(window.webkitStorageInfo){
          // Fallback for older API if needed, though webkitPersistentStorage is standard for Chrome-based
          window.webkitStorageInfo.requestQuota(
            window.PERSISTENT,
            this.targetBytes,
            grantedBytes => {
              window.requestFileSystem(window.PERSISTENT, grantedBytes, onSuccess, onError)
            },
            onError,
          )
        } else {
          // General Fallback (might fail if quota needed)
          window.requestFileSystem(window.PERSISTENT, this.targetBytes, onSuccess, onError)
        }
      }
    })
  }

  // Helper helper to wrap file/dir entry retrieval
  _getEntry(path, options = { create: false }, isDirectory = false) {
    return new Promise((resolve, reject) => {
      if (!this.fs) return reject(new Error("FileSystem not initialized"))
      const root = this.fs.root
      if (isDirectory) {
        root.getDirectory(path, options, resolve, reject)
      } else {
        root.getFile(path, options, resolve, reject)
      }
    })
  }

  async createDir(dirName) {
    return this._getEntry(dirName, { create: true }, true)
  }

  async exists(filename) {
    try {
      return await this._getEntry(filename, { create: false })
    } catch (e) {
      return false // Return false instead of rejecting for existence check ?? Or follow old behavior?
      // Old behavior: reject(err)
      // Let's stick to allowing it to throw if it's a real error, or if file not found.
      // However, typical exists() returns boolean.
      // The original code returned the entry on success, or REJECTED on error.
      // I'll keep the promise rejection chain to minimize logic changes.
      return Promise.reject(e)
    }
  }
  
  // NOTE: Original exists behavior was: Success -> resolve(entry), Error -> reject(err).
  // This is actually "getEntry".

  async writeFile(filename, data) {
    return new Promise(async (resolve, reject) => {
      try {
        const fileEntry = await this._getEntry(filename, { create: true })
        fileEntry.createWriter(fileWriter => {
          fileWriter.onwriteend = e => resolve(e)
          fileWriter.onerror = e => reject(e)
          fileWriter.write(data)
        }, reject)
      } catch (e) {
        reject(e)
      }
    })
  }

  async readFile(filename) {
    return new Promise(async (resolve, reject) => {
      try {
        const fileEntry = await this._getEntry(filename, { create: false })
        fileEntry.file(file => {
          const reader = new FileReader()
          reader.onloadend = function() {
            resolve(this.result)
          }
          reader.onerror = reject
          reader.readAsArrayBuffer(file)
        }, reject)
      } catch (e) {
        reject(e)
      }
    })
  }

  async readAsFile(filename) {
    return new Promise(async (resolve, reject) => {
      try {
        const fileEntry = await this._getEntry(filename, { create: false })
        fileEntry.file(resolve, reject)
      } catch (e) {
        reject(e)
      }
    })
  }

  async removeFile(filename) {
    return new Promise(async (resolve, reject) => {
      try {
        const fileEntry = await this._getEntry(filename, { create: false })
        fileEntry.remove(resolve, reject)
      } catch (e) {
        // If file doesn't exist, technically it's already "removed", but original rejected.
        reject(e)
      }
    })
  }

  async removeFolder(foldername) {
    return new Promise(async (resolve, reject) => {
      try {
        const dirEntry = await this._getEntry(foldername, { create: false }, true)
        dirEntry.removeRecursively(resolve, reject)
      } catch (e) {
        reject(e)
      }
    })
  }

  async getDirectory(dirName) {
    return this._getEntry(dirName, { create: false }, true)
  }
  
  // For compatibility with old "getURL" which took fs and filename
  // but logically it gets URL of a file.
  async getURL(filename) {
    const entry = await this._getEntry(filename)
    
    return entry.toURL()
  }
}

