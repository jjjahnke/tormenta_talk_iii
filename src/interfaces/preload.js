/**
 * TT3 Desktop App - Preload Script
 *
 * Secure bridge between main and renderer processes
 * Exposes controlled API to the renderer while maintaining security
 */

const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Folder and file operations
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  processPath: (path) => ipcRenderer.invoke('process-path', path),
  stopProcessing: () => ipcRenderer.invoke('stop-processing'),
  getStatus: () => ipcRenderer.invoke('get-status'),

  // Settings operations
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  // External operations
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Event listeners for main process communications
  onFolderSelected: (callback) => {
    ipcRenderer.on('folder-selected', (event, data) => callback(data))
  },

  onWorkflowStarted: (callback) => {
    ipcRenderer.on('workflow-started', (event, data) => callback(data))
  },

  onFileStarted: (callback) => {
    ipcRenderer.on('file-started', (event, data) => callback(data))
  },

  onFileStep: (callback) => {
    ipcRenderer.on('file-step', (event, data) => callback(data))
  },

  onFileCompleted: (callback) => {
    ipcRenderer.on('file-completed', (event, data) => callback(data))
  },

  onFileFailed: (callback) => {
    ipcRenderer.on('file-failed', (event, data) => callback(data))
  },

  onWorkflowCompleted: (callback) => {
    ipcRenderer.on('workflow-completed', (event, data) => callback(data))
  },

  onWorkflowError: (callback) => {
    ipcRenderer.on('workflow-error', (event, data) => callback(data))
  },

  onProcessingError: (callback) => {
    ipcRenderer.on('processing-error', (event, data) => callback(data))
  },

  onProcessingStopped: (callback) => {
    ipcRenderer.on('processing-stopped', (event, data) => callback(data))
  },

  // Menu event listeners
  onMenuStartProcessing: (callback) => {
    ipcRenderer.on('menu-start-processing', (event, data) => callback(data))
  },

  onMenuStopProcessing: (callback) => {
    ipcRenderer.on('menu-stop-processing', (event, data) => callback(data))
  },

  // Cleanup function to remove all listeners
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('folder-selected')
    ipcRenderer.removeAllListeners('workflow-started')
    ipcRenderer.removeAllListeners('file-started')
    ipcRenderer.removeAllListeners('file-step')
    ipcRenderer.removeAllListeners('file-completed')
    ipcRenderer.removeAllListeners('file-failed')
    ipcRenderer.removeAllListeners('workflow-completed')
    ipcRenderer.removeAllListeners('workflow-error')
    ipcRenderer.removeAllListeners('processing-error')
    ipcRenderer.removeAllListeners('processing-stopped')
    ipcRenderer.removeAllListeners('menu-start-processing')
    ipcRenderer.removeAllListeners('menu-stop-processing')
  }
})

// Expose version information
contextBridge.exposeInMainWorld('appInfo', {
  version: process.env.npm_package_version || '0.1.0',
  platform: process.platform,
  arch: process.arch
})

// Expose drag and drop file handling
contextBridge.exposeInMainWorld('dragDrop', {
  // Handle file drag over events
  onDragOver: (callback) => {
    document.addEventListener('dragover', (e) => {
      e.preventDefault()
      callback(e)
    })
  },

  // Handle file drop events
  onDrop: (callback) => {
    document.addEventListener('drop', (e) => {
      e.preventDefault()

      const files = Array.from(e.dataTransfer.files)
      const paths = files.map(file => file.path)

      callback(paths)
    })
  },

  // Handle drag enter events
  onDragEnter: (callback) => {
    document.addEventListener('dragenter', (e) => {
      e.preventDefault()
      callback(e)
    })
  },

  // Handle drag leave events
  onDragLeave: (callback) => {
    document.addEventListener('dragleave', (e) => {
      e.preventDefault()
      callback(e)
    })
  }
})
