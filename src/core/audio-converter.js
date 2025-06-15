const fs = require('fs-extra')
const path = require('path')
const os = require('os')

/**
 * Audio Converter - Coordination layer between FileProcessor, TTS, and file management
 * Manages temporary files, audio format conversion, and processing pipeline
 */
class AudioConverter {
  constructor (options = {}) {
    this.options = {
      outputFormat: options.outputFormat || 'aiff', // Default to AIFF for macOS compatibility
      tempDir: options.tempDir || path.join(os.tmpdir(), 'tt3-audio'),
      cleanupOnError: options.cleanupOnError !== false, // Default true
      maxFileSize: options.maxFileSize || 500 * 1024 * 1024, // 500MB limit
      ...options
    }
    this.initialized = false
    this.activeFiles = new Set() // Track files for cleanup
  }

  /**
   * Initialize the audio converter
   */
  async initialize () {
    try {
      await fs.ensureDir(this.options.tempDir)
      this.initialized = true
      return { success: true, tempDir: this.options.tempDir }
    } catch (error) {
      throw new Error(`Failed to initialize audio converter: ${error.message}`)
    }
  }

  /**
   * Convert text content to audio file with flexible output options
   * @param {string} textContent - Text content to convert
   * @param {string} sourceFilename - Original filename for audio naming
   * @param {Object} ttsService - Initialized TTS service instance
   * @param {Object} options - Override options for this conversion
   * @param {string} options.outputMode - 'temp' (default) or 'direct'
   * @param {string} options.outputDir - Directory for direct output (uses source file dir if not specified)
   * @param {boolean} options.overwrite - Whether to overwrite existing files (default: false)
   * @returns {Promise<{success: boolean, audioPath: string, tempPath: string, metadata: Object}>}
   */
  async convertToAudio (textContent, sourceFilename, ttsService, options = {}) {
    if (!this.initialized) {
      throw new Error('Audio converter not initialized. Call initialize() first.')
    }

    if (!textContent || textContent.trim().length === 0) {
      throw new Error('Text content is required for audio conversion')
    }

    if (!ttsService || !ttsService.convertTextToAudio) {
      throw new Error('Valid TTS service instance is required')
    }

    const mergedOptions = { ...this.options, ...options }
    const outputMode = mergedOptions.outputMode || 'temp'
    let audioPath = null
    let tempPath = null

    try {
      // Determine output path based on mode
      if (outputMode === 'direct') {
        audioPath = await this._generateDirectOutputPath(sourceFilename, mergedOptions)
      } else {
        // Generate audio filename based on source
        const audioFilename = this._generateAudioFilename(sourceFilename, mergedOptions.outputFormat)
        audioPath = path.join(this.options.tempDir, audioFilename)
        tempPath = audioPath
      }

      // Track file for cleanup
      this.activeFiles.add(audioPath)

      // Convert text to audio using TTS service
      const ttsResult = await ttsService.convertTextToAudio(textContent, audioPath, mergedOptions)

      // Validate the generated audio file
      await this._validateAudioFile(audioPath)

      // Generate metadata
      const metadata = await this._generateMetadata(sourceFilename, textContent, ttsResult)

      return {
        success: true,
        audioPath,
        tempPath: tempPath || audioPath, // For backward compatibility
        metadata,
        ttsResult,
        format: mergedOptions.outputFormat,
        outputMode
      }
    } catch (error) {
      // Cleanup on error if enabled
      if (mergedOptions.cleanupOnError && audioPath) {
        await this._cleanupFile(audioPath)
        this.activeFiles.delete(audioPath) // Remove from tracking since we cleaned it up
      }
      throw new Error(`Audio conversion failed: ${error.message}`)
    }
  }

  /**
   * Copy audio file to final destination (e.g., for iTunes import)
   * @param {string} tempPath - Temporary audio file path
   * @param {string} finalPath - Final destination path
   * @returns {Promise<{success: boolean, finalPath: string}>}
   */
  async copyToFinal (tempPath, finalPath) {
    try {
      // Ensure final directory exists
      await fs.ensureDir(path.dirname(finalPath))

      // Copy file to final location
      await fs.copy(tempPath, finalPath)

      // Validate copy was successful
      await this._validateAudioFile(finalPath)

      return {
        success: true,
        finalPath,
        size: (await fs.stat(finalPath)).size
      }
    } catch (error) {
      throw new Error(`Failed to copy audio file: ${error.message}`)
    }
  }

  /**
   * Clean up temporary audio files
   * @param {string|Array<string>} filePaths - File path(s) to clean up
   */
  async cleanup (filePaths = null) {
    const pathsToClean = filePaths ? (Array.isArray(filePaths) ? filePaths : [filePaths]) : Array.from(this.activeFiles)

    const results = []
    for (const filePath of pathsToClean) {
      try {
        await this._cleanupFile(filePath)
        this.activeFiles.delete(filePath)
        results.push({ path: filePath, success: true })
      } catch (error) {
        results.push({ path: filePath, success: false, error: error.message })
      }
    }

    return results
  }

  /**
   * Clean up all temporary files and directories
   */
  async cleanupAll () {
    try {
      // Clean up tracked files first
      await this.cleanup()

      // Remove temp directory if it exists and is empty
      if (await fs.pathExists(this.options.tempDir)) {
        const files = await fs.readdir(this.options.tempDir)
        if (files.length === 0) {
          await fs.remove(this.options.tempDir)
        }
      }

      this.activeFiles.clear()
      return { success: true, cleaned: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get conversion statistics and status
   */
  getStatus () {
    return {
      initialized: this.initialized,
      tempDir: this.options.tempDir,
      activeFiles: this.activeFiles.size,
      outputFormat: this.options.outputFormat,
      maxFileSize: this.options.maxFileSize
    }
  }

  // Private methods

  /**
   * Generate audio filename from source filename
   * @param {string} sourceFilename - Original text filename
   * @param {string} format - Audio format extension
   * @returns {string} Generated audio filename
   */
  _generateAudioFilename (sourceFilename, format = 'aiff') {
    // Remove extension and clean filename
    const basename = path.basename(sourceFilename, path.extname(sourceFilename))

    // Clean filename for audio output
    const cleanName = basename
      .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .toLowerCase()
      .substring(0, 100) // Limit length

    // Add timestamp for uniqueness
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('Z', '')

    // Ensure format has leading dot
    const extension = format.startsWith('.') ? format : `.${format}`

    return `${cleanName}-${timestamp}${extension}`
  }

  /**
   * Generate direct output path for audio file alongside source file
   * @param {string} sourceFilename - Original text filename (full path)
   * @param {Object} options - Options including outputDir, outputFormat, overwrite
   * @returns {Promise<string>} Generated audio file path
   */
  async _generateDirectOutputPath (sourceFilename, options) {
    const sourceDir = options.outputDir || path.dirname(sourceFilename)
    const basename = path.basename(sourceFilename, path.extname(sourceFilename))
    const format = options.outputFormat || 'mp3'
    const extension = format.startsWith('.') ? format : `.${format}`

    let audioPath = path.join(sourceDir, `${basename}${extension}`)

    // Handle filename conflicts with sequential numbering (unless overwrite is enabled)
    if (!options.overwrite && await fs.pathExists(audioPath)) {
      let counter = 1
      let candidatePath

      do {
        candidatePath = path.join(sourceDir, `${basename}-${counter}${extension}`)
        counter++
      } while (await fs.pathExists(candidatePath))

      audioPath = candidatePath
    }

    // Ensure output directory exists
    await fs.ensureDir(path.dirname(audioPath))

    return audioPath
  }

  /**
   * Validate audio file exists and has content
   * @param {string} audioPath - Path to audio file
   */
  async _validateAudioFile (audioPath) {
    try {
      const stats = await fs.stat(audioPath)

      if (!stats.isFile()) {
        throw new Error('Path is not a file')
      }

      if (stats.size === 0) {
        throw new Error('Audio file is empty')
      }

      if (stats.size > this.options.maxFileSize) {
        throw new Error(`Audio file exceeds maximum size limit (${this.options.maxFileSize} bytes)`)
      }

      return true
    } catch (error) {
      throw new Error(`Audio file validation failed: ${error.message}`)
    }
  }

  /**
   * Generate metadata for audio file
   * @param {string} sourceFilename - Original filename
   * @param {string} textContent - Original text content
   * @param {Object} ttsResult - TTS conversion result
   * @returns {Object} Audio metadata
   */
  async _generateMetadata (sourceFilename, textContent, ttsResult) {
    return {
      sourceFile: sourceFilename,
      audioFormat: this.options.outputFormat,
      textLength: textContent.length,
      wordCount: textContent.split(/\s+/).length,
      estimatedDuration: ttsResult.duration || 0,
      createdAt: new Date().toISOString(),
      ttsEngine: ttsResult.engine || 'unknown',
      processingMethod: ttsResult.method || 'single',
      chunksProcessed: ttsResult.chunks || 1
    }
  }

  /**
   * Clean up a single file
   * @param {string} filePath - File path to clean up
   */
  async _cleanupFile (filePath) {
    if (filePath && await fs.pathExists(filePath)) {
      await fs.unlink(filePath)
    }
  }
}

module.exports = AudioConverter
