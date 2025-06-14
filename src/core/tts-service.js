const { spawn } = require('child_process')
const fs = require('fs-extra')
const path = require('path')
const os = require('os')

/**
 * Local TTS Service - Cross-platform text-to-speech conversion
 * Uses platform-specific TTS engines for offline processing
 */
class LocalTTSService {
  constructor (options = {}) {
    this.options = {
      voice: options.voice || 'default',
      rate: options.rate || 200, // words per minute
      outputFormat: options.outputFormat || 'mp3',
      tempDir: options.tempDir || path.join(os.tmpdir(), 'tt3-tts'),
      ...options
    }
    this.platform = process.platform
    this.initialized = false
  }

  /**
   * Initialize the TTS service and verify platform compatibility
   */
  async initialize () {
    try {
      await fs.ensureDir(this.options.tempDir)
      await this._detectTTSCapabilities()
      this.initialized = true
      return { success: true, platform: this.platform, engine: this._getTTSEngine() }
    } catch (error) {
      throw new Error(`Failed to initialize TTS service: ${error.message}`)
    }
  }

  /**
   * Convert text to audio file
   * @param {string} text - Text content to convert
   * @param {string} outputPath - Path for the output audio file
   * @param {Object} options - Override options for this conversion
   * @returns {Promise<{success: boolean, audioPath: string, duration?: number}>}
   */
  async convertTextToAudio (text, outputPath, options = {}) {
    if (!this.initialized) {
      throw new Error('TTS service not initialized. Call initialize() first.')
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text content is required for TTS conversion')
    }

    const mergedOptions = { ...this.options, ...options }

    try {
      // Clean and prepare text for TTS
      const cleanedText = this._preprocessText(text)

      // Generate audio using platform-specific TTS
      const result = await this._generateAudio(cleanedText, outputPath, mergedOptions)

      return {
        success: true,
        audioPath: result.audioPath,
        duration: result.duration,
        textLength: cleanedText.length,
        engine: this._getTTSEngine()
      }
    } catch (error) {
      throw new Error(`TTS conversion failed: ${error.message}`)
    }
  }

  /**
   * Get information about available TTS capabilities
   */
  async getTTSInfo () {
    const engine = this._getTTSEngine()
    const voices = await this._getAvailableVoices()

    return {
      platform: this.platform,
      engine,
      voices,
      supportedFormats: this._getSupportedFormats(),
      initialized: this.initialized
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanup () {
    try {
      if (await fs.pathExists(this.options.tempDir)) {
        await fs.remove(this.options.tempDir)
      }
    } catch (error) {
      console.warn(`Warning: Failed to cleanup TTS temp directory: ${error.message}`)
    }
  }

  // Private methods

  /**
   * Detect platform TTS capabilities
   */
  async _detectTTSCapabilities () {
    switch (this.platform) {
      case 'darwin': // macOS
        return this._detectMacOSTTS()
      case 'win32': // Windows
        return this._detectWindowsTTS()
      case 'linux':
        return this._detectLinuxTTS()
      default:
        throw new Error(`Unsupported platform: ${this.platform}`)
    }
  }

  /**
   * Check macOS 'say' command availability
   */
  async _detectMacOSTTS () {
    return new Promise((resolve, reject) => {
      // Test with a simple empty string to verify say command works
      const testProcess = spawn('say', [''], { stdio: 'pipe' })
      testProcess.on('close', (code) => {
        // say command returns 0 even with empty string
        resolve(true)
      })
      testProcess.on('error', (error) => {
        reject(new Error(`macOS say command not found: ${error.message}`))
      })
    })
  }

  /**
   * Check Windows SAPI availability
   */
  async _detectWindowsTTS () {
    // For Windows, we'll use PowerShell with SAPI
    return new Promise((resolve, reject) => {
      const testScript = 'Add-Type -AssemblyName System.Speech; exit 0'
      const testProcess = spawn('powershell', ['-Command', testScript], { stdio: 'pipe' })
      testProcess.on('close', (code) => {
        if (code === 0) {
          resolve(true)
        } else {
          reject(new Error('Windows SAPI not available'))
        }
      })
      testProcess.on('error', () => {
        reject(new Error('PowerShell not found for Windows TTS'))
      })
    })
  }

  /**
   * Check Linux espeak/festival availability
   */
  async _detectLinuxTTS () {
    return new Promise((resolve, reject) => {
      // Try espeak first, then festival
      const testProcess = spawn('espeak', ['--version'], { stdio: 'pipe' })
      testProcess.on('close', (code) => {
        if (code === 0) {
          resolve(true)
        } else {
          // Try festival as fallback
          const festivalProcess = spawn('festival', ['--version'], { stdio: 'pipe' })
          festivalProcess.on('close', (festivalCode) => {
            if (festivalCode === 0) {
              resolve(true)
            } else {
              reject(new Error('Neither espeak nor festival found on Linux'))
            }
          })
          festivalProcess.on('error', () => {
            reject(new Error('No TTS engines found on Linux (tried espeak, festival)'))
          })
        }
      })
      testProcess.on('error', () => {
        // espeak not found, try festival
        const festivalProcess = spawn('festival', ['--version'], { stdio: 'pipe' })
        festivalProcess.on('close', (festivalCode) => {
          if (festivalCode === 0) {
            resolve(true)
          } else {
            reject(new Error('Neither espeak nor festival found on Linux'))
          }
        })
        festivalProcess.on('error', () => {
          reject(new Error('No TTS engines found on Linux'))
        })
      })
    })
  }

  /**
   * Generate audio using platform-specific TTS
   */
  async _generateAudio (text, outputPath, options) {
    switch (this.platform) {
      case 'darwin':
        return this._generateMacOSAudio(text, outputPath, options)
      case 'win32':
        return this._generateWindowsAudio(text, outputPath, options)
      case 'linux':
        return this._generateLinuxAudio(text, outputPath, options)
      default:
        throw new Error(`Audio generation not implemented for platform: ${this.platform}`)
    }
  }

  /**
   * Generate audio on macOS using 'say' command
   */
  async _generateMacOSAudio (text, outputPath, options) {
    return new Promise((resolve, reject) => {
      const args = [
        '-o', outputPath,
        '-r', options.rate.toString()
      ]

      if (options.voice && options.voice !== 'default') {
        args.push('-v', options.voice)
      }

      args.push(text)

      const sayProcess = spawn('say', args)

      sayProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            audioPath: outputPath,
            duration: this._estimateAudioDuration(text, options.rate)
          })
        } else {
          reject(new Error(`macOS say command failed with code ${code}`))
        }
      })

      sayProcess.on('error', (error) => {
        reject(new Error(`macOS say command error: ${error.message}`))
      })
    })
  }

  /**
   * Generate audio on Windows using PowerShell and SAPI
   */
  async _generateWindowsAudio (text, outputPath, options) {
    return new Promise((resolve, reject) => {
      const script = `
        Add-Type -AssemblyName System.Speech
        $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
        $synth.Rate = ${Math.round((options.rate - 200) / 20)} # Convert to SAPI rate (-10 to 10)
        $synth.SetOutputToWaveFile("${outputPath}")
        $synth.Speak("${text.replace(/"/g, '""')}")
        $synth.Dispose()
      `

      const psProcess = spawn('powershell', ['-Command', script])

      psProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            audioPath: outputPath,
            duration: this._estimateAudioDuration(text, options.rate)
          })
        } else {
          reject(new Error(`Windows PowerShell TTS failed with code ${code}`))
        }
      })

      psProcess.on('error', (error) => {
        reject(new Error(`Windows PowerShell TTS error: ${error.message}`))
      })
    })
  }

  /**
   * Generate audio on Linux using espeak
   */
  async _generateLinuxAudio (text, outputPath, options) {
    return new Promise((resolve, reject) => {
      const args = [
        '-w', outputPath, // output to wav file
        '-s', options.rate.toString(), // speed in words per minute
        text
      ]

      const espeakProcess = spawn('espeak', args)

      espeakProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            audioPath: outputPath,
            duration: this._estimateAudioDuration(text, options.rate)
          })
        } else {
          reject(new Error(`Linux espeak failed with code ${code}`))
        }
      })

      espeakProcess.on('error', (error) => {
        reject(new Error(`Linux espeak error: ${error.message}`))
      })
    })
  }

  /**
   * Preprocess text for better TTS output
   */
  _preprocessText (text) {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove common text artifacts
      .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
      .replace(/\b[A-Z]{2,}\b/g, (match) => match.toLowerCase()) // Convert CAPS to lowercase
      // Add pauses for better flow
      .replace(/\. /g, '. ... ') // Add pause after sentences
      .replace(/\n\n/g, ' ... ... ') // Convert paragraph breaks to pauses
      .trim()
  }

  /**
   * Estimate audio duration based on text length and rate
   */
  _estimateAudioDuration (text, rate) {
    const words = text.split(/\s+/).length
    const minutes = words / rate
    return Math.round(minutes * 60) // Return duration in seconds
  }

  /**
   * Get the TTS engine name for current platform
   */
  _getTTSEngine () {
    switch (this.platform) {
      case 'darwin':
        return 'macOS say'
      case 'win32':
        return 'Windows SAPI'
      case 'linux':
        return 'espeak'
      default:
        return 'unknown'
    }
  }

  /**
   * Get available voices (simplified for now)
   */
  async _getAvailableVoices () {
    // This is a simplified implementation
    // Real implementation would query system for available voices
    switch (this.platform) {
      case 'darwin':
        return ['Alex', 'Samantha', 'Victoria', 'default']
      case 'win32':
        return ['Microsoft David', 'Microsoft Zira', 'default']
      case 'linux':
        return ['default']
      default:
        return ['default']
    }
  }

  /**
   * Get supported audio formats
   */
  _getSupportedFormats () {
    switch (this.platform) {
      case 'darwin':
        return ['aiff', 'm4a']
      case 'win32':
        return ['wav']
      case 'linux':
        return ['wav']
      default:
        return ['wav']
    }
  }
}

module.exports = LocalTTSService
