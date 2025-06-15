const EventEmitter = require('events')
const path = require('path')
const fs = require('fs').promises

const FileProcessor = require('./file-processor')
const LocalTTSService = require('./tts-service')
const AudioConverter = require('./audio-converter')
const ITunesManager = require('./itunes-manager')

/**
 * Workflow Orchestrator - Main coordinator for news article to audio conversion
 * Manages the complete pipeline: File Processing → TTS → Audio Conversion → iTunes Import
 */
class WorkflowOrchestrator extends EventEmitter {
  constructor (options = {}) {
    super()

    this.options = {
      // Workflow configuration
      concurrency: options.concurrency || 1, // Process files one at a time by default
      retryAttempts: options.retryAttempts || 2,
      retryDelay: options.retryDelay || 1000, // 1 second

      // Output configuration
      outputMode: options.outputMode || 'direct', // 'direct' (default) or 'temp'
      enableItunesIntegration: options.enableItunesIntegration || false, // Optional iTunes integration
      overwriteExisting: options.overwriteExisting || false, // Overwrite existing files

      // Progress tracking
      enableProgress: options.enableProgress !== false,
      progressInterval: options.progressInterval || 500, // ms

      // Error handling
      continueOnError: options.continueOnError !== false,
      detailedErrors: options.detailedErrors !== false,

      // Component options
      fileProcessor: options.fileProcessor || {},
      ttsService: options.ttsService || {},
      audioConverter: options.audioConverter || {},
      itunesManager: options.itunesManager || {},

      ...options
    }

    // Workflow state
    this.state = {
      status: 'idle', // idle, running, paused, completed, failed
      totalFiles: 0,
      processedFiles: 0,
      successfulFiles: 0,
      failedFiles: 0,
      currentFile: null,
      currentStep: null,
      startTime: null,
      endTime: null,
      errors: [],
      results: []
    }

    // Component instances
    this.components = {
      fileProcessor: null,
      ttsService: null,
      audioConverter: null,
      itunesManager: null
    }

    this.initialized = false
  }

  /**
   * Initialize all workflow components
   */
  async initialize () {
    try {
      this.emit('workflow:initializing')

      // Initialize FileProcessor
      this.components.fileProcessor = new FileProcessor(this.options.fileProcessor)
      await this.components.fileProcessor.initialize()

      // Initialize TTS Service
      this.components.ttsService = new LocalTTSService(this.options.ttsService)
      await this.components.ttsService.initialize()

      // Initialize Audio Converter
      this.components.audioConverter = new AudioConverter(this.options.audioConverter)
      await this.components.audioConverter.initialize()

      // Initialize iTunes Manager (optional)
      if (this.options.enableItunesIntegration) {
        this.components.itunesManager = new ITunesManager(this.options.itunesManager)
        await this.components.itunesManager.initialize()
      } else {
        this.components.itunesManager = null
      }

      this.initialized = true
      this.emit('workflow:initialized')

      return { success: true, message: 'Workflow orchestrator initialized successfully' }
    } catch (error) {
      this.emit('workflow:error', { phase: 'initialization', error })
      throw new Error(`Failed to initialize workflow: ${error.message}`)
    }
  }

  /**
   * Process multiple files through the complete workflow
   * @param {string|Array<string>} input - File path(s) or directory path
   * @param {Object} options - Processing options
   */
  async processFiles (input, options = {}) {
    if (!this.initialized) {
      throw new Error('Workflow not initialized. Call initialize() first.')
    }

    try {
      // Reset state for new workflow
      this._resetState()
      this.state.status = 'running'
      this.state.startTime = new Date()

      this.emit('workflow:started', { input, options })

      // Step 1: Discover and validate input files
      const files = await this._discoverFiles(input)
      this.state.totalFiles = files.length

      if (files.length === 0) {
        throw new Error('No valid files found to process')
      }

      this.emit('workflow:files-discovered', { count: files.length, files })

      // Step 2: Process each file through the pipeline
      const results = await this._processFilesBatch(files, options)

      // Step 3: Generate summary and cleanup
      const summary = await this._generateSummary()

      this.state.status = 'completed'
      this.state.endTime = new Date()

      this.emit('workflow:completed', { summary, results })

      return {
        success: true,
        summary,
        results,
        duration: this.state.endTime - this.state.startTime
      }
    } catch (error) {
      this.state.status = 'failed'
      this.state.endTime = new Date()

      this.emit('workflow:failed', { error, state: this.state })
      throw error
    }
  }

  /**
   * Process a single file through the complete pipeline
   * @param {string} filePath - Path to the file to process
   * @param {Object} options - Processing options
   */
  async processSingleFile (filePath, options = {}) {
    const fileState = {
      path: filePath,
      startTime: new Date(),
      steps: {},
      success: false,
      error: null
    }

    try {
      this.state.currentFile = filePath
      this.emit('file:started', { filePath })

      // Step 1: Extract text from file
      this.state.currentStep = 'text-extraction'
      this.emit('file:step', { filePath, step: 'text-extraction' })

      const textResult = await this._executeWithRetry(
        () => this.components.fileProcessor.extractText(filePath),
        'text-extraction'
      )
      fileState.steps.textExtraction = textResult

      // Step 2: Convert text to audio
      this.state.currentStep = 'audio-conversion'
      this.emit('file:step', { filePath, step: 'audio-conversion' })

      const audioOptions = {
        ...options.audio || {},
        outputMode: this.options.outputMode,
        outputDir: path.dirname(filePath), // Save alongside source file
        overwrite: this.options.overwriteExisting
      }

      const audioResult = await this._executeWithRetry(
        () => this.components.audioConverter.convertToAudio(
          textResult.content,
          filePath, // Pass full path for direct output
          this.components.ttsService,
          audioOptions
        ),
        'audio-conversion'
      )
      fileState.steps.audioConversion = audioResult

      // Step 3: Import to iTunes (optional)
      if (this.options.enableItunesIntegration && this.components.itunesManager) {
        this.state.currentStep = 'itunes-import'
        this.emit('file:step', { filePath, step: 'itunes-import' })

        const itunesResult = await this._executeWithRetry(
          () => this.components.itunesManager.importAudioFile(
            audioResult.audioPath,
            {
              title: textResult.metadata?.title || path.basename(filePath, path.extname(filePath)),
              artist: 'News Audio Converter',
              album: `News ${new Date().toISOString().split('T')[0]}`,
              ...options.itunes || {}
            }
          ),
          'itunes-import'
        )
        fileState.steps.itunesImport = itunesResult
      } else {
        fileState.steps.itunesImport = { success: true, skipped: true, reason: 'iTunes integration disabled' }
      }

      // Step 4: Cleanup temporary files (only if temp mode was used)
      if (audioResult.outputMode === 'temp') {
        this.state.currentStep = 'cleanup'
        this.emit('file:step', { filePath, step: 'cleanup' })

        await this.components.audioConverter.cleanup([audioResult.audioPath])
        fileState.steps.cleanup = { success: true }
      } else {
        fileState.steps.cleanup = { success: true, skipped: true, reason: 'Direct output mode - no temp files to clean' }
      }

      fileState.success = true
      fileState.endTime = new Date()

      this.state.processedFiles++
      this.state.successfulFiles++
      this.state.results.push(fileState)

      this.emit('file:completed', { filePath, result: fileState })

      return fileState
    } catch (error) {
      fileState.error = error
      fileState.endTime = new Date()

      this.state.processedFiles++
      this.state.failedFiles++
      this.state.errors.push({ filePath, error, step: this.state.currentStep })
      this.state.results.push(fileState)

      this.emit('file:failed', { filePath, error, step: this.state.currentStep })

      if (!this.options.continueOnError) {
        throw error
      }

      return fileState
    } finally {
      this.state.currentFile = null
      this.state.currentStep = null
    }
  }

  /**
   * Get current workflow state and progress
   */
  getState () {
    return {
      ...this.state,
      progress: this.state.totalFiles > 0 ? this.state.processedFiles / this.state.totalFiles : 0,
      duration: this.state.startTime ? (this.state.endTime || new Date()) - this.state.startTime : 0,
      componentsStatus: {
        fileProcessor: this.components.fileProcessor?.getStatus?.() || null,
        ttsService: this.components.ttsService?.getStatus?.() || null,
        audioConverter: this.components.audioConverter?.getStatus?.() || null,
        itunesManager: this.components.itunesManager?.getStatus?.() || null
      }
    }
  }

  /**
   * Pause the workflow (if supported)
   */
  async pause () {
    if (this.state.status === 'running') {
      this.state.status = 'paused'
      this.emit('workflow:paused')
      return { success: true, message: 'Workflow paused' }
    }
    return { success: false, message: 'Workflow not running' }
  }

  /**
   * Resume paused workflow (if supported)
   */
  async resume () {
    if (this.state.status === 'paused') {
      this.state.status = 'running'
      this.emit('workflow:resumed')
      return { success: true, message: 'Workflow resumed' }
    }
    return { success: false, message: 'Workflow not paused' }
  }

  /**
   * Stop workflow and cleanup
   */
  async stop () {
    try {
      this.state.status = 'stopped'

      // Cleanup any active operations
      if (this.components.audioConverter) {
        await this.components.audioConverter.cleanupAll()
      }

      this.emit('workflow:stopped')
      return { success: true, message: 'Workflow stopped and cleaned up' }
    } catch (error) {
      this.emit('workflow:error', { phase: 'stop', error })
      throw error
    }
  }

  // Private methods

  /**
   * Reset workflow state for new processing
   */
  _resetState () {
    this.state = {
      status: 'idle',
      totalFiles: 0,
      processedFiles: 0,
      successfulFiles: 0,
      failedFiles: 0,
      currentFile: null,
      currentStep: null,
      startTime: null,
      endTime: null,
      errors: [],
      results: []
    }
  }

  /**
   * Discover files from input (file path, directory, or array)
   */
  async _discoverFiles (input) {
    const supportedExtensions = ['.txt', '.md']

    try {
      if (typeof input === 'string') {
        const stats = await fs.stat(input)

        if (stats.isFile()) {
          // Single file - validate it's supported
          const ext = path.extname(input).toLowerCase()
          if (!supportedExtensions.includes(ext)) {
            throw new Error(`Unsupported file type: ${ext}. Supported types: ${supportedExtensions.join(', ')}`)
          }

          // Validate file is readable
          await fs.access(input, fs.constants.R_OK)
          return [input]
        } else if (stats.isDirectory()) {
          // Directory - scan for supported files
          return await this._scanDirectory(input, supportedExtensions)
        } else {
          throw new Error(`Invalid input: ${input} is neither a file nor directory`)
        }
      } else if (Array.isArray(input)) {
        // Array of files - validate each one
        const validFiles = []

        for (const filePath of input) {
          try {
            const stats = await fs.stat(filePath)

            if (!stats.isFile()) {
              this.emit('file:warning', { filePath, reason: 'Not a file, skipping' })
              continue
            }

            const ext = path.extname(filePath).toLowerCase()
            if (!supportedExtensions.includes(ext)) {
              this.emit('file:warning', { filePath, reason: `Unsupported file type: ${ext}, skipping` })
              continue
            }

            // Validate file is readable
            await fs.access(filePath, fs.constants.R_OK)
            validFiles.push(filePath)
          } catch (error) {
            this.emit('file:warning', { filePath, reason: `Cannot access file: ${error.message}` })
          }
        }

        return validFiles
      } else {
        throw new Error('Invalid input type. Expected string (file/directory path) or array of file paths.')
      }
    } catch (error) {
      this.emit('workflow:error', { phase: 'file-discovery', error })
      throw new Error(`File discovery failed: ${error.message}`)
    }
  }

  /**
   * Recursively scan directory for supported files
   */
  async _scanDirectory (dirPath, supportedExtensions) {
    const files = []

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)

        if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase()
          if (supportedExtensions.includes(ext)) {
            try {
              // Validate file is readable
              await fs.access(fullPath, fs.constants.R_OK)
              files.push(fullPath)
            } catch (error) {
              this.emit('file:warning', { filePath: fullPath, reason: `Cannot read file: ${error.message}` })
            }
          }
        } else if (entry.isDirectory() && !entry.name.startsWith('.')) {
          // Recursively scan subdirectories (excluding hidden directories)
          const subFiles = await this._scanDirectory(fullPath, supportedExtensions)
          files.push(...subFiles)
        }
      }

      return files.sort() // Return sorted list for predictable order
    } catch (error) {
      throw new Error(`Failed to scan directory ${dirPath}: ${error.message}`)
    }
  }

  /**
   * Process files in batch with concurrency control
   */
  async _processFilesBatch (files, options) {
    const results = []
    const concurrency = this.options.concurrency

    // If concurrency is 1 or files array is small, process sequentially
    if (concurrency === 1 || files.length <= concurrency) {
      for (const filePath of files) {
        if (this.state.status === 'paused') {
          await this._waitForResume()
        }

        if (this.state.status === 'stopped') {
          break
        }

        const result = await this.processSingleFile(filePath, options)
        results.push(result)

        // Emit progress update
        this.emit('workflow:progress', {
          processed: this.state.processedFiles,
          total: this.state.totalFiles,
          progress: this.state.processedFiles / this.state.totalFiles
        })
      }

      return results
    }

    // Process files with concurrency control using Promise.allSettled
    const chunks = this._chunkArray(files, concurrency)

    for (const chunk of chunks) {
      if (this.state.status === 'stopped') {
        break
      }

      // Process chunk concurrently
      const chunkPromises = chunk.map(async (filePath) => {
        // Check for pause/stop before each file
        if (this.state.status === 'paused') {
          await this._waitForResume()
        }

        if (this.state.status === 'stopped') {
          return null
        }

        return await this.processSingleFile(filePath, options)
      })

      const chunkResults = await Promise.allSettled(chunkPromises)

      // Process results and handle any rejections
      for (const [index, result] of chunkResults.entries()) {
        if (result.status === 'fulfilled' && result.value !== null) {
          results.push(result.value)
        } else if (result.status === 'rejected') {
          const filePath = chunk[index]
          this.emit('file:failed', {
            filePath,
            error: result.reason,
            step: 'batch-processing'
          })

          // Add failed result to maintain consistency
          results.push({
            path: filePath,
            success: false,
            error: result.reason,
            startTime: new Date(),
            endTime: new Date(),
            steps: {}
          })

          if (!this.options.continueOnError) {
            throw result.reason
          }
        }
      }

      // Emit progress update after each chunk
      this.emit('workflow:progress', {
        processed: this.state.processedFiles,
        total: this.state.totalFiles,
        progress: this.state.processedFiles / this.state.totalFiles
      })
    }

    return results
  }

  /**
   * Split array into chunks for concurrent processing
   */
  _chunkArray (array, chunkSize) {
    const chunks = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  /**
   * Execute operation with retry logic
   */
  async _executeWithRetry (operation, stepName) {
    let lastError

    for (let attempt = 0; attempt <= this.options.retryAttempts; attempt++) {
      try {
        if (attempt > 0) {
          this.emit('operation:retry', { step: stepName, attempt })
          await this._delay(this.options.retryDelay * attempt)
        }

        return await operation()
      } catch (error) {
        lastError = error

        if (attempt < this.options.retryAttempts) {
          this.emit('operation:retry-failed', { step: stepName, attempt, error })
        }
      }
    }

    throw lastError
  }

  /**
   * Generate processing summary
   */
  async _generateSummary () {
    return {
      totalFiles: this.state.totalFiles,
      successfulFiles: this.state.successfulFiles,
      failedFiles: this.state.failedFiles,
      successRate: this.state.totalFiles > 0 ? this.state.successfulFiles / this.state.totalFiles : 0,
      duration: this.state.endTime - this.state.startTime,
      errors: this.state.errors,
      averageProcessingTime: this.state.results.length > 0
        ? this.state.results.reduce((sum, r) => sum + (r.endTime - r.startTime), 0) / this.state.results.length
        : 0
    }
  }

  /**
   * Wait for workflow to resume
   */
  async _waitForResume () {
    return new Promise((resolve) => {
      const checkStatus = () => {
        if (this.state.status === 'running' || this.state.status === 'stopped') {
          resolve()
        } else {
          setTimeout(checkStatus, 100)
        }
      }
      checkStatus()
    })
  }

  /**
   * Utility delay function
   */
  _delay (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

module.exports = WorkflowOrchestrator
