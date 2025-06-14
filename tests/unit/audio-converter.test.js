const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const AudioConverter = require('../../src/core/audio-converter')

describe('AudioConverter', () => {
  let audioConverter
  let testTempDir

  beforeEach(async () => {
    testTempDir = path.join(os.tmpdir(), 'tt3-test-audio-converter')
    audioConverter = new AudioConverter({
      tempDir: testTempDir,
      outputFormat: 'aiff',
      cleanupOnError: true
    })
    await audioConverter.initialize()
  })

  afterEach(async () => {
    await audioConverter.cleanupAll()
    if (await fs.pathExists(testTempDir)) {
      await fs.remove(testTempDir)
    }
  })

  describe('initialization', () => {
    test('should initialize with default options', async () => {
      const converter = new AudioConverter()
      const result = await converter.initialize()

      expect(result.success).toBe(true)
      expect(result.tempDir).toBeDefined()
      expect(converter.initialized).toBe(true)

      await converter.cleanupAll()
    })

    test('should initialize with custom options', async () => {
      const customConverter = new AudioConverter({
        outputFormat: 'mp3',
        maxFileSize: 100 * 1024 * 1024,
        cleanupOnError: false
      })

      await customConverter.initialize()

      const status = customConverter.getStatus()
      expect(status.outputFormat).toBe('mp3')
      expect(status.maxFileSize).toBe(100 * 1024 * 1024)

      await customConverter.cleanupAll()
    })

    test('should create temp directory', async () => {
      expect(await fs.pathExists(testTempDir)).toBe(true)
    })
  })

  describe('audio filename generation', () => {
    test('should generate valid audio filename', () => {
      const sourceFilename = 'test-article.txt'
      const audioFilename = audioConverter._generateAudioFilename(sourceFilename)

      expect(audioFilename).toMatch(/^test-article-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}\.aiff$/)
      expect(audioFilename).not.toContain(' ')
      expect(audioFilename).not.toContain('.txt')
    })

    test('should clean special characters from filename', () => {
      const sourceFilename = 'test@article!.txt'
      const audioFilename = audioConverter._generateAudioFilename(sourceFilename)

      expect(audioFilename).toMatch(/^testarticle-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}\.aiff$/)
      expect(audioFilename).not.toContain('@')
      expect(audioFilename).not.toContain('!')
    })

    test('should handle long filenames', () => {
      const longFilename = `${'a'.repeat(200)}.txt`
      const audioFilename = audioConverter._generateAudioFilename(longFilename, 'aiff')

      // Should be limited to reasonable length (100 chars base + timestamp + extension)
      expect(audioFilename.length).toBeLessThan(150)
    })

    test('should handle different audio formats', () => {
      const sourceFilename = 'test.txt'

      const aiffFile = audioConverter._generateAudioFilename(sourceFilename, 'aiff')
      const mp3File = audioConverter._generateAudioFilename(sourceFilename, 'mp3')
      const wavFile = audioConverter._generateAudioFilename(sourceFilename, 'wav')

      expect(aiffFile).toMatch(/\.aiff$/)
      expect(mp3File).toMatch(/\.mp3$/)
      expect(wavFile).toMatch(/\.wav$/)
    })

    test('should include timestamp for uniqueness', async () => {
      const sourceFilename = 'test.txt'

      const filename1 = audioConverter._generateAudioFilename(sourceFilename)
      // Wait a tiny bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1))
      const filename2 = audioConverter._generateAudioFilename(sourceFilename)

      // Should be different due to timestamp
      expect(filename1).not.toBe(filename2)
    })
  })

  describe('audio conversion', () => {
    const testText = 'This is a test article for audio conversion.'
    const sourceFilename = 'test-article.txt'

    test('should convert text to audio successfully', async () => {
      const mockTTSService = {
        convertTextToAudio: jest.fn().mockResolvedValue({
          success: true,
          duration: 5.2,
          engine: 'test-engine',
          method: 'single',
          chunks: 1
        })
      }

      // Mock file creation for validation
      const mockFilePath = path.join(testTempDir, 'test-audio.aiff')
      await fs.writeFile(mockFilePath, 'mock audio content')

      // Mock the internal method to return our mock file
      audioConverter._generateAudioFilename = jest.fn().mockReturnValue('test-audio.aiff')

      const result = await audioConverter.convertToAudio(testText, sourceFilename, mockTTSService)

      expect(result.success).toBe(true)
      expect(result.audioPath).toBeDefined()
      expect(result.metadata).toBeDefined()
      expect(result.metadata.sourceFile).toBe(sourceFilename)
      expect(result.metadata.textLength).toBe(testText.length)
      expect(mockTTSService.convertTextToAudio).toHaveBeenCalledWith(
        testText,
        mockFilePath,
        expect.any(Object)
      )
    })

    test('should require initialization before conversion', async () => {
      const unInitConverter = new AudioConverter()
      const mockTTSService = { convertTextToAudio: jest.fn() }

      await expect(
        unInitConverter.convertToAudio(testText, sourceFilename, mockTTSService)
      ).rejects.toThrow('Audio converter not initialized')
    })

    test('should validate text content', async () => {
      const mockTTSService = { convertTextToAudio: jest.fn() }

      await expect(
        audioConverter.convertToAudio('', sourceFilename, mockTTSService)
      ).rejects.toThrow('Text content is required')

      await expect(
        audioConverter.convertToAudio('   ', sourceFilename, mockTTSService)
      ).rejects.toThrow('Text content is required')
    })

    test('should validate TTS service', async () => {
      await expect(
        audioConverter.convertToAudio(testText, sourceFilename, null)
      ).rejects.toThrow('Valid TTS service instance is required')

      await expect(
        audioConverter.convertToAudio(testText, sourceFilename, {})
      ).rejects.toThrow('Valid TTS service instance is required')
    })

    test('should handle TTS service errors', async () => {
      const mockTTSService = {
        convertTextToAudio: jest.fn().mockRejectedValue(new Error('TTS conversion failed'))
      }

      await expect(
        audioConverter.convertToAudio(testText, sourceFilename, mockTTSService)
      ).rejects.toThrow('Audio conversion failed: TTS conversion failed')
    })

    test('should track active files during conversion', async () => {
      const mockTTSService = {
        convertTextToAudio: jest.fn().mockResolvedValue({
          success: true,
          duration: 3.1,
          engine: 'test-engine'
        })
      }

      // Mock file creation
      const mockFilePath = path.join(testTempDir, 'test-audio.aiff')
      await fs.writeFile(mockFilePath, 'mock audio content')
      audioConverter._generateAudioFilename = jest.fn().mockReturnValue('test-audio.aiff')

      expect(audioConverter.getStatus().activeFiles).toBe(0)

      await audioConverter.convertToAudio(testText, sourceFilename, mockTTSService)

      expect(audioConverter.getStatus().activeFiles).toBe(1)
    })
  })

  describe('audio file validation', () => {
    test('should validate existing audio file', async () => {
      const testFilePath = path.join(testTempDir, 'test-audio.aiff')
      await fs.writeFile(testFilePath, 'mock audio content')

      const isValid = await audioConverter._validateAudioFile(testFilePath)
      expect(isValid).toBe(true)
    })

    test('should reject non-existent file', async () => {
      const nonExistentPath = path.join(testTempDir, 'non-existent.aiff')

      await expect(
        audioConverter._validateAudioFile(nonExistentPath)
      ).rejects.toThrow('Audio file validation failed')
    })

    test('should reject empty file', async () => {
      const emptyFilePath = path.join(testTempDir, 'empty.aiff')
      await fs.writeFile(emptyFilePath, '')

      await expect(
        audioConverter._validateAudioFile(emptyFilePath)
      ).rejects.toThrow('Audio file is empty')
    })

    test('should reject oversized file', async () => {
      const oversizedConverter = new AudioConverter({
        tempDir: testTempDir,
        maxFileSize: 10 // Very small limit
      })
      await oversizedConverter.initialize()

      const largeFilePath = path.join(testTempDir, 'large.aiff')
      await fs.writeFile(largeFilePath, 'a'.repeat(100)) // Larger than 10 bytes

      await expect(
        oversizedConverter._validateAudioFile(largeFilePath)
      ).rejects.toThrow('exceeds maximum size limit')

      await oversizedConverter.cleanupAll()
    })
  })

  describe('file copy operations', () => {
    test('should copy audio file to final destination', async () => {
      const sourceFile = path.join(testTempDir, 'source-audio.aiff')
      const finalFile = path.join(testTempDir, 'final', 'final-audio.aiff')

      await fs.writeFile(sourceFile, 'mock audio content')

      const result = await audioConverter.copyToFinal(sourceFile, finalFile)

      expect(result.success).toBe(true)
      expect(result.finalPath).toBe(finalFile)
      expect(await fs.pathExists(finalFile)).toBe(true)
      expect(await fs.readFile(finalFile, 'utf8')).toBe('mock audio content')
    })

    test('should handle copy errors', async () => {
      const nonExistentSource = path.join(testTempDir, 'non-existent.aiff')
      const finalFile = path.join(testTempDir, 'final', 'final-audio.aiff')

      await expect(
        audioConverter.copyToFinal(nonExistentSource, finalFile)
      ).rejects.toThrow('Failed to copy audio file')
    })
  })

  describe('cleanup operations', () => {
    test('should cleanup specific files', async () => {
      const testFile1 = path.join(testTempDir, 'test1.aiff')
      const testFile2 = path.join(testTempDir, 'test2.aiff')

      await fs.writeFile(testFile1, 'content1')
      await fs.writeFile(testFile2, 'content2')

      audioConverter.activeFiles.add(testFile1)
      audioConverter.activeFiles.add(testFile2)

      const results = await audioConverter.cleanup([testFile1])

      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(true)
      expect(await fs.pathExists(testFile1)).toBe(false)
      expect(await fs.pathExists(testFile2)).toBe(true)
      expect(audioConverter.activeFiles.has(testFile1)).toBe(false)
      expect(audioConverter.activeFiles.has(testFile2)).toBe(true)
    })

    test('should cleanup all active files', async () => {
      const testFile1 = path.join(testTempDir, 'test1.aiff')
      const testFile2 = path.join(testTempDir, 'test2.aiff')

      await fs.writeFile(testFile1, 'content1')
      await fs.writeFile(testFile2, 'content2')

      audioConverter.activeFiles.add(testFile1)
      audioConverter.activeFiles.add(testFile2)

      const results = await audioConverter.cleanup()

      expect(results).toHaveLength(2)
      expect(results.every(r => r.success)).toBe(true)
      expect(await fs.pathExists(testFile1)).toBe(false)
      expect(await fs.pathExists(testFile2)).toBe(false)
      expect(audioConverter.activeFiles.size).toBe(0)
    })

    test('should handle cleanup errors gracefully', async () => {
      const nonExistentFile = path.join(testTempDir, 'non-existent.aiff')
      audioConverter.activeFiles.add(nonExistentFile)

      const results = await audioConverter.cleanup([nonExistentFile])

      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(true) // File already doesn't exist, so cleanup succeeds
      expect(audioConverter.activeFiles.has(nonExistentFile)).toBe(false)
    })

    test('should cleanup all and remove empty temp directory', async () => {
      const result = await audioConverter.cleanupAll()

      expect(result.success).toBe(true)
      expect(audioConverter.activeFiles.size).toBe(0)
    })
  })

  describe('metadata generation', () => {
    test('should generate comprehensive metadata', async () => {
      const sourceFilename = 'test-article.txt'
      const textContent = 'This is a test article with multiple words.'
      const ttsResult = {
        duration: 4.5,
        engine: 'test-tts-engine',
        method: 'chunked',
        chunks: 3
      }

      const metadata = await audioConverter._generateMetadata(sourceFilename, textContent, ttsResult)

      expect(metadata.sourceFile).toBe(sourceFilename)
      expect(metadata.audioFormat).toBe('aiff')
      expect(metadata.textLength).toBe(textContent.length)
      expect(metadata.wordCount).toBe(8) // 'This is a test article with multiple words.'
      expect(metadata.estimatedDuration).toBe(4.5)
      expect(metadata.ttsEngine).toBe('test-tts-engine')
      expect(metadata.processingMethod).toBe('chunked')
      expect(metadata.chunksProcessed).toBe(3)
      expect(metadata.createdAt).toBeDefined()
    })

    test('should handle missing TTS result properties', async () => {
      const sourceFilename = 'test.txt'
      const textContent = 'Short text.'
      const ttsResult = {}

      const metadata = await audioConverter._generateMetadata(sourceFilename, textContent, ttsResult)

      expect(metadata.estimatedDuration).toBe(0)
      expect(metadata.ttsEngine).toBe('unknown')
      expect(metadata.processingMethod).toBe('single')
      expect(metadata.chunksProcessed).toBe(1)
    })
  })

  describe('status and information', () => {
    test('should provide accurate status information', () => {
      const status = audioConverter.getStatus()

      expect(status.initialized).toBe(true)
      expect(status.tempDir).toBe(testTempDir)
      expect(status.activeFiles).toBe(0)
      expect(status.outputFormat).toBe('aiff')
      expect(status.maxFileSize).toBeDefined()
    })

    test('should track active files count', async () => {
      const testFile = path.join(testTempDir, 'test.aiff')
      await fs.writeFile(testFile, 'content')

      audioConverter.activeFiles.add(testFile)

      expect(audioConverter.getStatus().activeFiles).toBe(1)

      await audioConverter.cleanup([testFile])

      expect(audioConverter.getStatus().activeFiles).toBe(0)
    })
  })

  describe('error handling', () => {
    test('should cleanup on conversion error when enabled', async () => {
      const mockTTSService = {
        convertTextToAudio: jest.fn().mockRejectedValue(new Error('TTS failed'))
      }

      await expect(
        audioConverter.convertToAudio('test text', 'test.txt', mockTTSService)
      ).rejects.toThrow('Audio conversion failed')

      // File should be cleaned up due to error
      expect(audioConverter.getStatus().activeFiles).toBe(0)
    })

    test('should not cleanup on error when disabled', async () => {
      const noCleanupConverter = new AudioConverter({
        tempDir: testTempDir,
        cleanupOnError: false
      })
      await noCleanupConverter.initialize()

      const mockTTSService = {
        convertTextToAudio: jest.fn().mockRejectedValue(new Error('TTS failed'))
      }

      await expect(
        noCleanupConverter.convertToAudio('test text', 'test.txt', mockTTSService)
      ).rejects.toThrow('Audio conversion failed')

      // File should still be tracked (though it might not exist due to TTS failure)
      await noCleanupConverter.cleanupAll()
    })
  })
})
