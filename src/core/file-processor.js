const fs = require('fs-extra')
const path = require('path')

/**
 * File Processor - Text file processing and content extraction
 * Handles discovery, reading, and preprocessing of text files for TTS conversion
 */
class FileProcessor {
  constructor (options = {}) {
    this.options = {
      supportedExtensions: options.supportedExtensions || ['.txt', '.md'],
      maxFileSize: options.maxFileSize || 1024 * 1024, // 1MB default
      encoding: options.encoding || 'utf8',
      recursive: options.recursive !== false, // default to true
      ...options
    }
    this.processed = []
    this.errors = []
    this.initialized = false
  }

  /**
   * Initialize the file processor
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async initialize () {
    try {
      // Validate that we can access the file system
      await fs.access(process.cwd())

      this.initialized = true
      return {
        success: true,
        message: 'FileProcessor initialized successfully'
      }
    } catch (error) {
      throw new Error(`Failed to initialize FileProcessor: ${error.message}`)
    }
  }

  /**
   * Check if the file processor is ready
   * @returns {boolean}
   */
  isReady () {
    return this.initialized
  }

  /**
   * Get current status information
   * @returns {Object}
   */
  getStatus () {
    return {
      ready: this.initialized,
      processed: this.processed.length,
      errors: this.errors.length,
      supportedExtensions: this.options.supportedExtensions
    }
  }

  /**
   * Discover and process all text files in a directory
   * @param {string} directoryPath - Path to the directory to process
   * @returns {Promise<{files: Array, errors: Array, summary: Object}>}
   */
  async processDirectory (directoryPath) {
    if (!await fs.pathExists(directoryPath)) {
      throw new Error(`Directory not found: ${directoryPath}`)
    }

    const stats = await fs.stat(directoryPath)
    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${directoryPath}`)
    }

    try {
      this.processed = []
      this.errors = []

      const discoveredFiles = await this._discoverFiles(directoryPath)
      const processedFiles = await this._processFiles(discoveredFiles)

      return {
        files: processedFiles,
        errors: this.errors,
        summary: {
          totalFound: discoveredFiles.length,
          successfullyProcessed: processedFiles.length,
          errors: this.errors.length,
          totalTextLength: processedFiles.reduce((sum, file) => sum + file.cleanedText.length, 0)
        }
      }
    } catch (error) {
      throw new Error(`Failed to process directory: ${error.message}`)
    }
  }

  /**
   * Process a single text file
   * @param {string} filePath - Path to the text file
   * @returns {Promise<Object>} Processed file object
   */
  async processSingleFile (filePath) {
    if (!await fs.pathExists(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    const stats = await fs.stat(filePath)
    if (!stats.isFile()) {
      throw new Error(`Path is not a file: ${filePath}`)
    }

    if (!this._isSupportedFile(filePath)) {
      throw new Error(`Unsupported file type: ${path.extname(filePath)}`)
    }

    try {
      const fileInfo = this._extractFileInfo(filePath, stats)
      const rawContent = await this._readFileContent(filePath)
      const cleanedText = this._preprocessText(rawContent)

      return {
        ...fileInfo,
        rawContent,
        cleanedText,
        success: true
      }
    } catch (error) {
      throw new Error(`Failed to process file ${filePath}: ${error.message}`)
    }
  }

  /**
   * Extract text from a single file (alias for processSingleFile for WorkflowOrchestrator compatibility)
   * @param {string} filePath - Path to the text file
   * @returns {Promise<Object>} Processed file object with 'content' property for WorkflowOrchestrator
   */
  async extractText (filePath) {
    const result = await this.processSingleFile(filePath)
    // Add 'content' property for WorkflowOrchestrator compatibility
    return {
      ...result,
      content: result.cleanedText
    }
  }

  /**
   * Generate audio-friendly filename from text file
   * @param {string} originalPath - Original file path
   * @param {string} extension - Audio file extension (e.g., '.aiff')
   * @returns {string} Generated filename
   */
  generateAudioFilename (originalPath, extension = '.aiff') {
    // Normalize path separators for cross-platform compatibility
    const normalizedPath = originalPath.replace(/\\/g, '/')
    const basename = path.basename(normalizedPath, path.extname(normalizedPath))

    // Clean filename for audio output
    const cleanName = basename
      .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .toLowerCase()

    const timestamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    return `${timestamp}-${cleanName}${extension}`
  }

  /**
   * Discover all supported files in directory
   */
  async _discoverFiles (directoryPath) {
    const files = []

    try {
      const items = await fs.readdir(directoryPath)

      for (const item of items) {
        const itemPath = path.join(directoryPath, item)
        const stats = await fs.stat(itemPath)

        if (stats.isFile() && this._isSupportedFile(itemPath)) {
          files.push(itemPath)
        } else if (stats.isDirectory() && this.options.recursive) {
          // Recursively process subdirectories
          const subFiles = await this._discoverFiles(itemPath)
          files.push(...subFiles)
        }
      }
    } catch (error) {
      this.errors.push({
        type: 'discovery',
        path: directoryPath,
        message: `Failed to read directory: ${error.message}`
      })
    }

    return files
  }

  /**
   * Process array of file paths
   */
  async _processFiles (filePaths) {
    const processedFiles = []

    for (const filePath of filePaths) {
      try {
        const processed = await this.processSingleFile(filePath)
        processedFiles.push(processed)
      } catch (error) {
        this.errors.push({
          type: 'processing',
          path: filePath,
          message: error.message
        })
      }
    }

    return processedFiles
  }

  /**
   * Check if file is supported based on extension
   */
  _isSupportedFile (filePath) {
    const ext = path.extname(filePath).toLowerCase()
    return this.options.supportedExtensions.includes(ext)
  }

  /**
   * Extract metadata from file path and stats
   */
  _extractFileInfo (filePath, stats) {
    return {
      originalPath: filePath,
      filename: path.basename(filePath),
      dirname: path.dirname(filePath),
      extension: path.extname(filePath),
      size: stats.size,
      modified: stats.mtime,
      created: stats.birthtime || stats.ctime
    }
  }

  /**
   * Read file content with encoding
   */
  async _readFileContent (filePath) {
    const stats = await fs.stat(filePath)

    if (stats.size > this.options.maxFileSize) {
      throw new Error(`File too large: ${stats.size} bytes (max: ${this.options.maxFileSize})`)
    }

    try {
      return await fs.readFile(filePath, this.options.encoding)
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`)
    }
  }

  /**
   * Clean and preprocess text for TTS
   */
  _preprocessText (rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return ''
    }

    let cleaned = rawText
      // Remove or replace markdown formatting
      .replace(/#{1,6}\s+/g, '') // Remove markdown headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
      .replace(/`(.*?)`/g, '$1') // Remove inline code formatting
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to just text

      // Clean up whitespace and line breaks
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple line breaks
      .replace(/\s+/g, ' ') // Normalize whitespace

      // Remove or replace special characters that cause TTS issues
      .replace(/["""'']/g, '"') // Normalize quotes
      .replace(/[–—]/g, '-') // Normalize dashes
      .replace(/…/g, '...') // Replace ellipsis

      // Clean up sentence structure for better TTS flow
      .replace(/\.\s*\n/g, '. ') // Join sentences split across lines
      .replace(/([.!?])\s*([a-z])/g, '$1 $2') // Ensure space after punctuation

      .trim()

    // Remove empty lines and ensure proper sentence endings
    cleaned = cleaned
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join(' ')
      .replace(/\s+/g, ' ')

    // Only add period for actual sentences that need it
    // Don't add to labels, phrases ending with colons, or text that doesn't look like prose
    if (cleaned &&
        cleaned.length > 15 &&
        cleaned.includes(' ') &&
        !cleaned.match(/[.!?:]$/) &&
        !cleaned.match(/:\s*[^\s]+$/) && // Avoid "label: value" patterns
        cleaned.split(' ').length > 2) { // Must be more than a couple words
      cleaned += '.'
    }

    return cleaned
  }

  /**
   * Validate processed content
   */
  validateContent (processedFile) {
    const issues = []

    if (!processedFile.cleanedText || processedFile.cleanedText.trim().length === 0) {
      issues.push('No readable text content found')
    }

    if (processedFile.cleanedText && processedFile.cleanedText.length < 10) {
      issues.push('Text content is too short (less than 10 characters)')
    }

    if (processedFile.cleanedText && processedFile.cleanedText.length > 50000) {
      issues.push('Text content is very long (over 50,000 characters)')
    }

    return {
      isValid: issues.length === 0,
      issues
    }
  }

  /**
   * Get processing statistics
   */
  getStats () {
    return {
      processedCount: this.processed.length,
      errorCount: this.errors.length,
      supportedExtensions: this.options.supportedExtensions,
      maxFileSize: this.options.maxFileSize
    }
  }

  /**
   * Clear processing history
   */
  reset () {
    this.processed = []
    this.errors = []
  }
}

module.exports = FileProcessor
