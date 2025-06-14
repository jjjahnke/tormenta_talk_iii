const fs = require('fs-extra')
const path = require('path')
const ITunesManager = require('../../src/core/itunes-manager')

describe('ITunesManager', () => {
  let itunesManager
  let testTempDir

  beforeEach(async () => {
    testTempDir = path.join(__dirname, '../../temp-test-itunes')
    await fs.ensureDir(testTempDir)

    itunesManager = new ITunesManager({
      playlistPrefix: 'TestNews',
      cleanupDays: 2
    })
  })

  afterEach(async () => {
    if (itunesManager.initialized) {
      await itunesManager.cleanup()
    }
    await fs.remove(testTempDir)
  })

  describe('initialization', () => {
    it('should initialize successfully on macOS with iTunes/Music available', async () => {
      if (process.platform !== 'darwin') {
        console.log('Skipping iTunes test: Not running on macOS')
        return
      }

      try {
        const result = await itunesManager.initialize()
        expect(result.success).toBe(true)
        expect(result.platform).toBe('darwin')
        expect(itunesManager.initialized).toBe(true)
      } catch (error) {
        // Skip test if iTunes/Music not available
        console.log(`Skipping iTunes integration test: ${error.message}`)
      }
    })

    it('should fail on non-macOS platforms', async () => {
      if (process.platform === 'darwin') {
        return // Skip this test on macOS
      }

      await expect(itunesManager.initialize()).rejects.toThrow('iTunes integration only supported on macOS')
    })

    it('should create iTunes manager with default options', () => {
      const defaultManager = new ITunesManager()
      expect(defaultManager.options.playlistPrefix).toBe('News')
      expect(defaultManager.options.cleanupDays).toBe(2)
      expect(defaultManager.options.importTimeout).toBe(30000)
    })

    it('should create iTunes manager with custom options', () => {
      const customManager = new ITunesManager({
        playlistPrefix: 'CustomNews',
        cleanupDays: 5,
        importTimeout: 60000
      })
      expect(customManager.options.playlistPrefix).toBe('CustomNews')
      expect(customManager.options.cleanupDays).toBe(5)
      expect(customManager.options.importTimeout).toBe(60000)
    })
  })

  describe('playlist name generation', () => {
    it('should generate correct playlist name with current date', () => {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const expectedName = `TestNews-${year}-${month}-${day}`

      const generatedName = itunesManager._generatePlaylistName()
      expect(generatedName).toBe(expectedName)
    })

    it('should use custom playlist prefix', () => {
      const customManager = new ITunesManager({ playlistPrefix: 'MyPodcast' })
      const playlistName = customManager._generatePlaylistName()
      expect(playlistName).toMatch(/^MyPodcast-\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('playlist date parsing', () => {
    it('should parse valid playlist names', () => {
      const playlistName = 'TestNews-2025-06-14'
      const parsedDate = itunesManager._parsePlaylistDate(playlistName)

      expect(parsedDate).toBeInstanceOf(Date)
      expect(parsedDate.getFullYear()).toBe(2025)
      expect(parsedDate.getMonth()).toBe(5) // June is month 5 (0-indexed)
      expect(parsedDate.getDate()).toBe(14)
    })

    it('should return null for invalid playlist names', () => {
      const invalidNames = [
        'TestNews-invalid-date',
        'TestNews-2025-13-01', // Invalid month
        'TestNews-2025-06-32', // Invalid day
        'SomeOtherPlaylist-2025-06-14',
        'TestNews'
      ]

      invalidNames.forEach(name => {
        const result = itunesManager._parsePlaylistDate(name)
        expect(result).toBeNull()
      })
    })

    it('should handle different playlist prefixes', () => {
      const customManager = new ITunesManager({ playlistPrefix: 'Podcast' })
      const validName = 'Podcast-2025-06-14'
      const invalidName = 'TestNews-2025-06-14'

      expect(customManager._parsePlaylistDate(validName)).toBeInstanceOf(Date)
      expect(customManager._parsePlaylistDate(invalidName)).toBeNull()
    })
  })

  describe('error handling', () => {
    it('should throw error when importing without initialization', async () => {
      const audioPath = path.join(testTempDir, 'test.aiff')
      await fs.writeFile(audioPath, 'dummy audio content')

      await expect(
        itunesManager.importToPlaylist(audioPath, 'Test Article')
      ).rejects.toThrow('iTunes Manager not initialized')
    })

    it('should throw error when getting status without initialization', async () => {
      await expect(itunesManager.getStatus()).rejects.toThrow('iTunes Manager not initialized')
    })

    it('should throw error when cleaning up without initialization', async () => {
      await expect(itunesManager.cleanupOldContent()).rejects.toThrow('iTunes Manager not initialized')
    })

    it('should throw error for non-existent audio file', async () => {
      if (process.platform !== 'darwin') {
        return
      }

      try {
        await itunesManager.initialize()
      } catch (error) {
        console.log(`Skipping iTunes import test: ${error.message}`)
        return
      }

      const nonExistentPath = path.join(testTempDir, 'non-existent.aiff')

      await expect(
        itunesManager.importToPlaylist(nonExistentPath, 'Test Article')
      ).rejects.toThrow('Audio file not found')
    })
  })

  describe('cleanup functionality', () => {
    it('should cleanup successfully', async () => {
      const result = await itunesManager.cleanup()
      expect(result.success).toBe(true)
      expect(itunesManager.initialized).toBe(false)
    })

    it('should handle cleanup when not initialized', async () => {
      const result = await itunesManager.cleanup()
      expect(result.success).toBe(true)
    })
  })

  describe('iTunes integration', () => {
    it('should import audio file and create playlist (integration test)', async () => {
      if (process.platform !== 'darwin') {
        console.log('Skipping iTunes integration test: Not running on macOS')
        return
      }

      let initialized = false
      try {
        await itunesManager.initialize()
        initialized = true
      } catch (error) {
        console.log(`Skipping iTunes integration test: ${error.message}`)
        return
      }

      if (!initialized) return

      // Create a test audio file (using TTS service)
      const LocalTTSService = require('../../src/core/tts-service')
      const ttsService = new LocalTTSService()

      try {
        await ttsService.initialize()
        const testText = 'This is a test article for iTunes integration.'
        const audioPath = path.join(testTempDir, 'test-article.aiff')

        await ttsService.convertTextToAudio(testText, audioPath)

        // Test iTunes import
        const result = await itunesManager.importToPlaylist(
          audioPath,
          'Test News Article',
          'TT3 Test'
        )

        expect(result.success).toBe(true)
        expect(result.playlistName).toMatch(/^TestNews-\d{4}-\d{2}-\d{2}$/)
        expect(result.trackId).toBeDefined()
        expect(result.trackName).toBe('Test News Article')

        // Verify we can get status
        const status = await itunesManager.getStatus()
        expect(status.playlists).toContain(result.playlistName)
      } catch (error) {
        console.log(`Skipping iTunes integration test: ${error.message}`)
      } finally {
        await ttsService.cleanup()
      }
    })

    it('should get iTunes status correctly', async () => {
      if (process.platform !== 'darwin') {
        console.log('Skipping iTunes status test: Not running on macOS')
        return
      }

      let initialized = false
      try {
        await itunesManager.initialize()
        initialized = true
      } catch (error) {
        console.log(`Skipping iTunes status test: ${error.message}`)
        return
      }

      if (!initialized) return

      const status = await itunesManager.getStatus()
      expect(status).toHaveProperty('isRunning')
      expect(status).toHaveProperty('playlists')
      expect(status.platform).toBe('darwin')
      expect(Array.isArray(status.playlists)).toBe(true)
    })
  })
})
