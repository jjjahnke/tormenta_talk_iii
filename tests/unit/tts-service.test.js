const LocalTTSService = require('../../src/core/tts-service')
const fs = require('fs-extra')
const path = require('path')
const os = require('os')

describe('LocalTTSService', () => {
  let ttsService
  let testTempDir

  beforeEach(() => {
    testTempDir = path.join(os.tmpdir(), 'tt3-test-tts')
    ttsService = new LocalTTSService({
      tempDir: testTempDir,
      rate: 200
    })
  })

  afterEach(async () => {
    await ttsService.cleanup()
    if (await fs.pathExists(testTempDir)) {
      await fs.remove(testTempDir)
    }
  })

  describe('initialization', () => {
    test('should initialize successfully on supported platforms', async () => {
      const result = await ttsService.initialize()

      expect(result.success).toBe(true)
      expect(result.platform).toBe(process.platform)
      expect(result.engine).toBeDefined()
      expect(ttsService.initialized).toBe(true)
    })

    test('should create temp directory on initialization', async () => {
      await ttsService.initialize()

      const tempDirExists = await fs.pathExists(testTempDir)
      expect(tempDirExists).toBe(true)
    })

    test('should provide TTS info after initialization', async () => {
      await ttsService.initialize()

      const info = await ttsService.getTTSInfo()
      expect(info.platform).toBe(process.platform)
      expect(info.engine).toBeDefined()
      expect(info.voices).toBeInstanceOf(Array)
      expect(info.supportedFormats).toBeInstanceOf(Array)
      expect(info.initialized).toBe(true)
    })
  })

  describe('text preprocessing', () => {
    beforeEach(async () => {
      await ttsService.initialize()
    })

    test('should preprocess text correctly', () => {
      const testText = `
        This is a TEST with   multiple    spaces.
        
        This is a new paragraph with https://example.com/url and MORE CAPS.
      `

      const processed = ttsService._preprocessText(testText)

      expect(processed).not.toContain('https://example.com/url')
      expect(processed).not.toContain('TEST')
      expect(processed).not.toContain('MORE CAPS')
      expect(processed).toContain('test')
      expect(processed).toContain('more caps')
      expect(processed).toContain('...')
    })

    test('should handle empty or whitespace-only text', () => {
      expect(ttsService._preprocessText('')).toBe('')
      expect(ttsService._preprocessText('   \n\t   ')).toBe('')
    })
  })

  describe('audio duration estimation', () => {
    test('should estimate duration correctly', () => {
      const text = 'This is a test sentence with ten words total.'
      const rate = 200 // words per minute

      const duration = ttsService._estimateAudioDuration(text, rate)

      // 10 words at 200 WPM = 0.05 minutes = 3 seconds
      expect(duration).toBe(3)
    })
  })

  describe('error handling', () => {
    test('should throw error when converting without initialization', async () => {
      const outputPath = path.join(testTempDir, 'test.wav')

      await expect(
        ttsService.convertTextToAudio('test text', outputPath)
      ).rejects.toThrow('TTS service not initialized')
    })

    test('should throw error for empty text', async () => {
      await ttsService.initialize()
      const outputPath = path.join(testTempDir, 'test.wav')

      await expect(
        ttsService.convertTextToAudio('', outputPath)
      ).rejects.toThrow('Text content is required')

      await expect(
        ttsService.convertTextToAudio('   ', outputPath)
      ).rejects.toThrow('Text content is required')
    })
  })

  describe('platform detection', () => {
    test('should detect current platform correctly', () => {
      expect(ttsService.platform).toBe(process.platform)
    })

    test('should return correct TTS engine for platform', () => {
      const engine = ttsService._getTTSEngine()

      switch (process.platform) {
        case 'darwin':
          expect(engine).toBe('macOS say')
          break
        case 'win32':
          expect(engine).toBe('Windows SAPI')
          break
        case 'linux':
          expect(engine).toBe('espeak')
          break
        default:
          expect(engine).toBe('unknown')
      }
    })

    test('should return supported formats for platform', () => {
      const formats = ttsService._getSupportedFormats()

      expect(formats).toBeInstanceOf(Array)
      expect(formats.length).toBeGreaterThan(0)
    })
  })

  describe('cleanup', () => {
    test('should cleanup temp directory', async () => {
      await ttsService.initialize()

      // Verify temp dir exists
      expect(await fs.pathExists(testTempDir)).toBe(true)

      await ttsService.cleanup()

      // Temp dir should be removed
      expect(await fs.pathExists(testTempDir)).toBe(false)
    })

    test('should handle cleanup when temp dir does not exist', async () => {
      // Should not throw error even if temp dir doesn't exist
      await expect(ttsService.cleanup()).resolves.not.toThrow()
    })
  })
})

// Integration test (only run if we can actually test TTS on this platform)
describe('LocalTTSService Integration', () => {
  let ttsService
  let testTempDir

  beforeEach(() => {
    testTempDir = path.join(os.tmpdir(), 'tt3-integration-test')
    ttsService = new LocalTTSService({
      tempDir: testTempDir
    })
  })

  afterEach(async () => {
    await ttsService.cleanup()
  })

  // This test will only pass on systems with TTS available
  test('should convert text to audio file', async () => {
    let initialized = false

    try {
      await ttsService.initialize()
      initialized = true
    } catch (error) {
      // Skip test if TTS not available on this system
      console.log(`Skipping TTS integration test: ${error.message}`)
      return
    }

    if (!initialized) return

    const testText = 'This is a test of the text to speech system.'
    // Use appropriate format for the platform
    const supportedFormats = ttsService._getSupportedFormats()
    const format = supportedFormats[0] // Use first supported format
    const outputPath = path.join(testTempDir, `test-output.${format}`)

    const result = await ttsService.convertTextToAudio(testText, outputPath)

    expect(result.success).toBe(true)
    expect(result.audioPath).toBe(outputPath)
    expect(result.duration).toBeGreaterThan(0)
    expect(result.textLength).toBeGreaterThan(0)
    expect(result.engine).toBeDefined()

    // Verify audio file was created
    const audioFileExists = await fs.pathExists(outputPath)
    expect(audioFileExists).toBe(true)

    // Verify audio file has content
    const stats = await fs.stat(outputPath)
    expect(stats.size).toBeGreaterThan(0)
  }, 10000) // Allow 10 seconds for TTS processing

  describe('Chunking functionality', () => {
    test('should chunk long text at sentence boundaries', () => {
      const longText = 'This is sentence one. This is sentence two. This is sentence three. This is sentence four. This is sentence five.'
      const chunks = ttsService._chunkText(longText, 15) // 15 words max per chunk

      expect(chunks.length).toBeGreaterThan(1)

      // Verify each chunk respects word limit
      chunks.forEach(chunk => {
        const wordCount = chunk.split(/\s+/).length
        expect(wordCount).toBeLessThanOrEqual(15)
      })

      // Verify all text is preserved
      const rejoined = chunks.join(' ')
      expect(rejoined.replace(/\s+/g, ' ')).toBe(longText.replace(/\s+/g, ' '))
    })

    test('should not chunk short text', () => {
      const shortText = 'This is a short sentence.'
      const chunks = ttsService._chunkText(shortText, 50)

      expect(chunks.length).toBe(1)
      expect(chunks[0]).toBe(shortText)
    })

    test('should handle text with no sentence endings', () => {
      const noEndingText = 'Word1 Word2 Word3 Word4 Word5 Word6 Word7 Word8 Word9 Word10'
      const chunks = ttsService._chunkText(noEndingText, 5)

      expect(chunks.length).toBe(1) // Should not split without sentence boundaries
      expect(chunks[0]).toBe(noEndingText)
    })

    test('should use chunking for long text on macOS', async () => {
      if (process.platform !== 'darwin') {
        return // Skip on non-macOS platforms
      }

      await ttsService.initialize()

      // Create long text that exceeds chunk size
      const longText = Array(600).fill('This is a test sentence.').join(' ')
      const outputPath = path.join(testTempDir, 'chunked-test.aiff')

      const result = await ttsService.convertTextToAudio(longText, outputPath, {
        enableChunking: true,
        maxChunkWords: 100
      })

      expect(result.success).toBe(true)
      expect(result.method).toBe('chunked')
      expect(result.chunks).toBeGreaterThan(1)

      // Verify output file exists and has content
      const audioFileExists = await fs.pathExists(outputPath)
      expect(audioFileExists).toBe(true)

      const stats = await fs.stat(outputPath)
      expect(stats.size).toBeGreaterThan(0)
    }, 30000) // Allow 30 seconds for chunked processing

    test('should disable chunking when option is false', async () => {
      if (process.platform !== 'darwin') {
        return // Skip on non-macOS platforms
      }

      await ttsService.initialize()

      const shortText = 'This is a short test sentence for single processing.'
      const outputPath = path.join(testTempDir, 'single-test.aiff')

      const result = await ttsService.convertTextToAudio(shortText, outputPath, {
        enableChunking: false
      })

      expect(result.success).toBe(true)
      expect(result.method).toBe('single')
      expect(result.chunks).toBeUndefined()
    }, 10000)
  })
})
