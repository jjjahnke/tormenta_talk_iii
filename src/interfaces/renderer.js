/**
 * TT3 Desktop App - Renderer Process
 *
 * Frontend logic for the desktop application UI
 * Handles drag-and-drop, progress display, and user interactions
 */

class TT3Renderer {
  constructor () {
    this.selectedPath = null
    this.isProcessing = false
    this.processedFiles = new Map() // Track file processing status

    this.initializeElements()
    this.setupEventListeners()
    this.setupDragAndDrop()
    this.setupElectronListeners()

    // Set app version
    document.getElementById('appVersion').textContent = window.appInfo?.version || '0.1.0'
  }

  initializeElements () {
    this.elements = {
      dropZone: document.getElementById('dropZone'),
      selectBtn: document.getElementById('selectBtn'),
      processBtn: document.getElementById('processBtn'),
      stopBtn: document.getElementById('stopBtn'),
      progressSection: document.getElementById('progressSection'),
      progressStats: document.getElementById('progressStats'),
      progressFill: document.getElementById('progressFill'),
      currentFile: document.getElementById('currentFile'),
      fileList: document.getElementById('fileList'),
      errorsSection: document.getElementById('errorsSection'),
      errorsList: document.getElementById('errorsList')
    }
  }

  setupEventListeners () {
    // Button click handlers
    this.elements.selectBtn.addEventListener('click', () => this.handleSelectFolder())
    this.elements.processBtn.addEventListener('click', () => this.handleStartProcessing())
    this.elements.stopBtn.addEventListener('click', () => this.handleStopProcessing())

    // Drop zone click handler
    this.elements.dropZone.addEventListener('click', () => this.handleSelectFolder())
  }

  setupDragAndDrop () {
    // Handle drag over
    window.dragDrop.onDragOver((e) => {
      this.elements.dropZone.classList.add('drag-over')
    })

    // Handle drag enter
    window.dragDrop.onDragEnter((e) => {
      this.elements.dropZone.classList.add('drag-over')
    })

    // Handle drag leave
    window.dragDrop.onDragLeave((e) => {
      // Only remove if leaving the drop zone completely
      if (!this.elements.dropZone.contains(e.relatedTarget)) {
        this.elements.dropZone.classList.remove('drag-over')
      }
    })

    // Handle drop
    window.dragDrop.onDrop((paths) => {
      this.elements.dropZone.classList.remove('drag-over')

      if (paths.length > 0) {
        // Take the first path (file or folder)
        const droppedPath = paths[0]
        this.handlePathSelected(droppedPath)
      }
    })
  }

  setupElectronListeners () {
    // Folder selection
    window.electronAPI.onFolderSelected((path) => {
      this.handlePathSelected(path)
    })

    // Workflow events
    window.electronAPI.onWorkflowStarted((data) => {
      this.handleWorkflowStarted(data)
    })

    window.electronAPI.onFileStarted((data) => {
      this.handleFileStarted(data)
    })

    window.electronAPI.onFileStep((data) => {
      this.handleFileStep(data)
    })

    window.electronAPI.onFileCompleted((data) => {
      this.handleFileCompleted(data)
    })

    window.electronAPI.onFileFailed((data) => {
      this.handleFileFailed(data)
    })

    window.electronAPI.onWorkflowCompleted((data) => {
      this.handleWorkflowCompleted(data)
    })

    window.electronAPI.onWorkflowError((data) => {
      this.handleWorkflowError(data)
    })

    window.electronAPI.onProcessingError((error) => {
      this.showError('Processing Error', error)
    })

    window.electronAPI.onProcessingStopped(() => {
      this.handleProcessingStopped()
    })

    // Menu events
    window.electronAPI.onMenuStartProcessing(() => {
      if (!this.isProcessing && this.selectedPath) {
        this.handleStartProcessing()
      }
    })

    window.electronAPI.onMenuStopProcessing(() => {
      if (this.isProcessing) {
        this.handleStopProcessing()
      }
    })
  }

  async handleSelectFolder () {
    if (this.isProcessing) return

    try {
      const path = await window.electronAPI.selectFolder()
      if (path) {
        this.handlePathSelected(path)
      }
    } catch (error) {
      this.showError('Selection Error', error.message)
    }
  }

  handlePathSelected (path) {
    this.selectedPath = path

    // Update UI to show selected path
    this.elements.dropZone.innerHTML = `
      <div class="drop-zone-icon">✅</div>
      <div class="drop-zone-text">Selected: ${this.getBaseName(path)}</div>
      <div class="drop-zone-subtext">Ready to process files</div>
    `

    // Enable process button
    this.elements.processBtn.disabled = false

    // Clear previous errors
    this.hideErrors()
  }

  async handleStartProcessing () {
    if (!this.selectedPath || this.isProcessing) return

    this.isProcessing = true
    this.updateButtonStates()

    // Clear previous results
    this.processedFiles.clear()
    this.clearFileList()
    this.hideErrors()

    try {
      await window.electronAPI.processPath(this.selectedPath)
    } catch (error) {
      this.showError('Processing Failed', error.message)
      this.isProcessing = false
      this.updateButtonStates()
    }
  }

  async handleStopProcessing () {
    if (!this.isProcessing) return

    try {
      await window.electronAPI.stopProcessing()
    } catch (error) {
      this.showError('Stop Error', error.message)
    }
  }

  handleWorkflowStarted (data) {
    this.isProcessing = true
    this.updateButtonStates()

    // Show progress section
    this.elements.progressSection.classList.remove('hidden')

    // Update progress stats
    this.elements.progressStats.textContent = `0 / ${data.totalFiles}`
    this.elements.currentFile.textContent = 'Starting workflow...'

    // Initialize progress bar
    this.elements.progressFill.style.width = '0%'

    console.log('Workflow started:', data)
  }

  handleFileStarted (data) {
    this.elements.currentFile.innerHTML = `
      <span class="spinner"></span>Processing: ${data.fileName}
    `

    // Add file to list
    this.addFileToList(data.fileName, 'processing')

    console.log('File started:', data)
  }

  handleFileStep (data) {
    // Update current file with step information
    this.elements.currentFile.innerHTML = `
      <span class="spinner"></span>${data.fileName}: ${data.step}
    `

    console.log('File step:', data)
  }

  handleFileCompleted (data) {
    // Update file status
    this.updateFileStatus(data.fileName, 'completed')

    // Update progress
    this.updateProgress()

    console.log('File completed:', data)
  }

  handleFileFailed (data) {
    // Update file status
    this.updateFileStatus(data.fileName, 'failed')

    // Add to errors
    this.addError(data.fileName, data.error)

    // Update progress
    this.updateProgress()

    console.log('File failed:', data)
  }

  handleWorkflowCompleted (data) {
    this.isProcessing = false
    this.updateButtonStates()

    // Update final status
    this.elements.currentFile.textContent = `Completed! ${data.successful}/${data.total} files processed successfully.`

    // Update progress bar to 100%
    this.elements.progressFill.style.width = '100%'

    console.log('Workflow completed:', data)
  }

  handleWorkflowError (data) {
    this.isProcessing = false
    this.updateButtonStates()

    this.elements.currentFile.textContent = 'Workflow failed with errors'
    this.showError('Workflow Error', data.error)

    console.error('Workflow error:', data)
  }

  handleProcessingStopped () {
    this.isProcessing = false
    this.updateButtonStates()

    this.elements.currentFile.textContent = 'Processing stopped by user'

    console.log('Processing stopped')
  }

  updateButtonStates () {
    this.elements.selectBtn.disabled = this.isProcessing
    this.elements.processBtn.disabled = this.isProcessing || !this.selectedPath
    this.elements.stopBtn.disabled = !this.isProcessing
  }

  updateProgress () {
    const total = this.processedFiles.size
    const completed = Array.from(this.processedFiles.values())
      .filter(status => status === 'completed' || status === 'failed').length

    if (total > 0) {
      const percentage = (completed / total) * 100
      this.elements.progressFill.style.width = `${percentage}%`
      this.elements.progressStats.textContent = `${completed} / ${total}`
    }
  }

  addFileToList (fileName, status) {
    this.processedFiles.set(fileName, status)

    const fileItem = document.createElement('div')
    fileItem.className = 'file-item'
    fileItem.setAttribute('data-file', fileName)

    fileItem.innerHTML = `
      <div class="file-name">${fileName}</div>
      <div class="file-status status-${status}">${this.getStatusText(status)}</div>
    `

    this.elements.fileList.appendChild(fileItem)
  }

  updateFileStatus (fileName, status) {
    this.processedFiles.set(fileName, status)

    const fileItem = this.elements.fileList.querySelector(`[data-file="${fileName}"]`)
    if (fileItem) {
      const statusElement = fileItem.querySelector('.file-status')
      statusElement.className = `file-status status-${status}`
      statusElement.textContent = this.getStatusText(status)
    }
  }

  clearFileList () {
    this.elements.fileList.innerHTML = ''
    this.processedFiles.clear()
  }

  getStatusText (status) {
    switch (status) {
      case 'processing': return 'Processing...'
      case 'completed': return 'Completed'
      case 'failed': return 'Failed'
      default: return 'Unknown'
    }
  }

  addError (fileName, error) {
    const errorItem = document.createElement('div')
    errorItem.className = 'error-item'

    errorItem.innerHTML = `
      <div class="error-file">${fileName}</div>
      <div class="error-message">${error}</div>
    `

    this.elements.errorsList.appendChild(errorItem)
    this.elements.errorsSection.classList.remove('hidden')
  }

  hideErrors () {
    this.elements.errorsSection.classList.add('hidden')
    this.elements.errorsList.innerHTML = ''
  }

  showError (title, message) {
    // Create a temporary error display
    const errorDiv = document.createElement('div')
    errorDiv.className = 'error-item'
    errorDiv.innerHTML = `
      <div class="error-file">${title}</div>
      <div class="error-message">${message}</div>
    `

    this.elements.errorsList.appendChild(errorDiv)
    this.elements.errorsSection.classList.remove('hidden')

    // Auto-hide after 5 seconds unless it's a workflow error
    if (!title.includes('Workflow')) {
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.remove()
          if (this.elements.errorsList.children.length === 0) {
            this.hideErrors()
          }
        }
      }, 5000)
    }
  }

  getBaseName (filePath) {
    return filePath.split(/[\\/]/).pop()
  }
}

// Initialize the renderer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const renderer = new TT3Renderer()
  console.log('TT3 Renderer initialized', renderer)
})

// Handle app cleanup
window.addEventListener('beforeunload', () => {
  if (window.electronAPI && typeof window.electronAPI.removeAllListeners === 'function') {
    window.electronAPI.removeAllListeners()
  }
})
