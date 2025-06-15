// Mock all dependencies before imports
jest.mock('../../src/core/file-processor')
jest.mock('../../src/core/tts-service')
jest.mock('../../src/core/audio-converter')
jest.mock('../../src/core/itunes-manager')
jest.mock('fs', () => {
  const mockConstants = { R_OK: 4 }
  const mockPromises = {
    stat: jest.fn(),
    access: jest.fn(),
    readdir: jest.fn()
  }
  mockPromises.constants = mockConstants

  return {
    promises: mockPromises,
    constants: mockConstants
  }
})
jest.mock('fs-extra', () => ({
  promises: {
    stat: jest.fn(),
    access: jest.fn(),
    readdir: jest.fn(),
    mkdir: jest.fn(),
    remove: jest.fn(),
    copy: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn()
  },
  constants: { R_OK: 4 },
  stat: jest.fn(),
  access: jest.fn(),
  readdir: jest.fn(),
  mkdir: jest.fn(),
  remove: jest.fn(),
  copy: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn()
}))

const WorkflowOrchestrator = require('../../src/core/workflow-orchestrator')
const fs = require('fs').promises

const FileProcessor = require('../../src/core/file-processor')
const LocalTTSService = require('../../src/core/tts-service')
const AudioConverter = require('../../src/core/audio-converter')
const ITunesManager = require('../../src/core/itunes-manager')

describe('WorkflowOrchestrator', () => {
  let orchestrator
  let mockFileProcessor, mockTTSService, mockAudioConverter, mockITunesManager

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Create mock instances
    mockFileProcessor = {
      initialize: jest.fn().mockResolvedValue(),
      extractText: jest.fn().mockResolvedValue({
        content: 'Sample text content',
        metadata: { title: 'Test Article' }
      }),
      getStatus: jest.fn().mockReturnValue({ ready: true })
    }

    mockTTSService = {
      initialize: jest.fn().mockResolvedValue(),
      getStatus: jest.fn().mockReturnValue({ ready: true })
    }

    mockAudioConverter = {
      initialize: jest.fn().mockResolvedValue(),
      convertToAudio: jest.fn().mockResolvedValue({
        audioPath: '/tmp/audio/test.wav',
        metadata: { duration: 60 }
      }),
      cleanup: jest.fn().mockResolvedValue(),
      cleanupAll: jest.fn().mockResolvedValue(),
      getStatus: jest.fn().mockReturnValue({ ready: true })
    }

    mockITunesManager = {
      initialize: jest.fn().mockResolvedValue(),
      importAudioFile: jest.fn().mockResolvedValue({
        trackId: 'track-123',
        playlistAdded: true
      }),
      getStatus: jest.fn().mockReturnValue({ ready: true })
    }

    // Mock constructors
    FileProcessor.mockImplementation(() => mockFileProcessor)
    LocalTTSService.mockImplementation(() => mockTTSService)
    AudioConverter.mockImplementation(() => mockAudioConverter)
    ITunesManager.mockImplementation(() => mockITunesManager)

    orchestrator = new WorkflowOrchestrator()
  })

  describe('Constructor and Initialization', () => {
    test('should create orchestrator with default options', () => {
      expect(orchestrator.options.concurrency).toBe(1)
      expect(orchestrator.options.retryAttempts).toBe(2)
      expect(orchestrator.options.continueOnError).toBe(true)
      expect(orchestrator.initialized).toBe(false)
    })

    test('should create orchestrator with custom options', () => {
      const customOrchestrator = new WorkflowOrchestrator({
        concurrency: 3,
        retryAttempts: 5,
        continueOnError: false
      })

      expect(customOrchestrator.options.concurrency).toBe(3)
      expect(customOrchestrator.options.retryAttempts).toBe(5)
      expect(customOrchestrator.options.continueOnError).toBe(false)
    })

    test('should initialize all components successfully', async () => {
      const result = await orchestrator.initialize()

      expect(mockFileProcessor.initialize).toHaveBeenCalled()
      expect(mockTTSService.initialize).toHaveBeenCalled()
      expect(mockAudioConverter.initialize).toHaveBeenCalled()
      // iTunes Manager should not be initialized by default (enableItunesIntegration: false)
      expect(mockITunesManager.initialize).not.toHaveBeenCalled()

      expect(orchestrator.initialized).toBe(true)
      expect(result.success).toBe(true)
    })

    test('should initialize iTunes Manager when enabled', async () => {
      const itunesOrchestrator = new WorkflowOrchestrator({ enableItunesIntegration: true })
      const result = await itunesOrchestrator.initialize()

      expect(mockFileProcessor.initialize).toHaveBeenCalled()
      expect(mockTTSService.initialize).toHaveBeenCalled()
      expect(mockAudioConverter.initialize).toHaveBeenCalled()
      expect(mockITunesManager.initialize).toHaveBeenCalled()

      expect(itunesOrchestrator.initialized).toBe(true)
      expect(result.success).toBe(true)
    })

    test('should handle initialization failure', async () => {
      mockTTSService.initialize.mockRejectedValue(new Error('TTS init failed'))

      await expect(orchestrator.initialize()).rejects.toThrow('Failed to initialize workflow: TTS init failed')
      expect(orchestrator.initialized).toBe(false)
    })
  })

  describe('File Discovery', () => {
    beforeEach(async () => {
      await orchestrator.initialize()
    })

    test('should discover single text file', async () => {
      const filePath = '/path/to/test.txt'
      fs.stat.mockResolvedValue({ isFile: () => true, isDirectory: () => false })
      fs.access.mockResolvedValue()

      const files = await orchestrator._discoverFiles(filePath)

      expect(files).toEqual([filePath])
      expect(fs.stat).toHaveBeenCalledWith(filePath)
      expect(fs.access).toHaveBeenCalledWith(filePath, fs.constants.R_OK)
    })

    test('should discover single markdown file', async () => {
      const filePath = '/path/to/test.md'
      fs.stat.mockResolvedValue({ isFile: () => true, isDirectory: () => false })
      fs.access.mockResolvedValue()

      const files = await orchestrator._discoverFiles(filePath)

      expect(files).toEqual([filePath])
    })

    test('should reject unsupported file type', async () => {
      const filePath = '/path/to/test.pdf'
      fs.stat.mockResolvedValue({ isFile: () => true, isDirectory: () => false })

      await expect(orchestrator._discoverFiles(filePath)).rejects.toThrow('Unsupported file type: .pdf')
    })

    test('should scan directory for supported files', async () => {
      const dirPath = '/path/to/dir'
      fs.stat.mockResolvedValue({ isFile: () => false, isDirectory: () => true })
      fs.readdir.mockResolvedValue([
        { name: 'test1.txt', isFile: () => true, isDirectory: () => false },
        { name: 'test2.md', isFile: () => true, isDirectory: () => false },
        { name: 'ignored.pdf', isFile: () => true, isDirectory: () => false },
        { name: 'subdir', isFile: () => false, isDirectory: () => true }
      ])

      // Mock subdirectory scan
      fs.readdir.mockImplementation((path) => {
        if (path === dirPath) {
          return Promise.resolve([
            { name: 'test1.txt', isFile: () => true, isDirectory: () => false },
            { name: 'test2.md', isFile: () => true, isDirectory: () => false },
            { name: 'ignored.pdf', isFile: () => true, isDirectory: () => false },
            { name: 'subdir', isFile: () => false, isDirectory: () => true }
          ])
        } else if (path === '/path/to/dir/subdir') {
          return Promise.resolve([
            { name: 'test3.txt', isFile: () => true, isDirectory: () => false }
          ])
        }
        return Promise.resolve([])
      })

      fs.access.mockResolvedValue()

      const files = await orchestrator._discoverFiles(dirPath)

      expect(files).toHaveLength(3)
      expect(files).toContain('/path/to/dir/test1.txt')
      expect(files).toContain('/path/to/dir/test2.md')
      expect(files).toContain('/path/to/dir/subdir/test3.txt')
      expect(files).not.toContain('/path/to/dir/ignored.pdf')
    })

    test('should validate array of files', async () => {
      const inputFiles = ['/path/to/test1.txt', '/path/to/test2.md', '/path/to/invalid.pdf']
      fs.stat.mockImplementation((filePath) => {
        if (filePath.endsWith('.pdf')) {
          return Promise.resolve({ isFile: () => true, isDirectory: () => false })
        }
        return Promise.resolve({ isFile: () => true, isDirectory: () => false })
      })
      fs.access.mockResolvedValue()

      const eventSpy = jest.fn()
      orchestrator.on('file:warning', eventSpy)

      const files = await orchestrator._discoverFiles(inputFiles)

      expect(files).toHaveLength(2)
      expect(files).toContain('/path/to/test1.txt')
      expect(files).toContain('/path/to/test2.md')
      expect(eventSpy).toHaveBeenCalledWith({
        filePath: '/path/to/invalid.pdf',
        reason: 'Unsupported file type: .pdf, skipping'
      })
    })

    test('should handle inaccessible files in array', async () => {
      const inputFiles = ['/path/to/test1.txt', '/path/to/missing.txt']
      fs.stat.mockImplementation((filePath) => {
        if (filePath.includes('missing')) {
          throw new Error('File not found')
        }
        return Promise.resolve({ isFile: () => true, isDirectory: () => false })
      })
      fs.access.mockResolvedValue()

      const eventSpy = jest.fn()
      orchestrator.on('file:warning', eventSpy)

      const files = await orchestrator._discoverFiles(inputFiles)

      expect(files).toHaveLength(1)
      expect(files).toContain('/path/to/test1.txt')
      expect(eventSpy).toHaveBeenCalledWith({
        filePath: '/path/to/missing.txt',
        reason: 'Cannot access file: File not found'
      })
    })
  })

  describe('Single File Processing', () => {
    beforeEach(async () => {
      await orchestrator.initialize()
    })

    test('should process single file successfully without iTunes integration', async () => {
      const filePath = '/path/to/test.txt'
      const eventSpy = jest.fn()
      orchestrator.on('file:completed', eventSpy)

      const result = await orchestrator.processSingleFile(filePath)

      expect(result.success).toBe(true)
      expect(result.path).toBe(filePath)
      expect(result.steps.textExtraction.content).toBe('Sample text content')
      expect(result.steps.audioConversion.audioPath).toBe('/tmp/audio/test.wav')
      // iTunes import should be skipped by default
      expect(result.steps.itunesImport.skipped).toBe(true)
      expect(result.steps.itunesImport.reason).toBe('iTunes integration disabled')
      // Cleanup should be skipped in direct mode (new default)
      expect(result.steps.cleanup.skipped).toBe(true)
      expect(result.steps.cleanup.reason).toBe('Direct output mode - no temp files to clean')

      expect(mockFileProcessor.extractText).toHaveBeenCalledWith(filePath)
      expect(mockAudioConverter.convertToAudio).toHaveBeenCalled()
      expect(mockITunesManager.importAudioFile).not.toHaveBeenCalled()
      expect(mockAudioConverter.cleanup).not.toHaveBeenCalled()

      expect(eventSpy).toHaveBeenCalledWith({
        filePath,
        result: expect.objectContaining({ success: true })
      })
    })

    test('should process single file successfully with iTunes integration', async () => {
      // Reset mocks to ensure clean state
      jest.clearAllMocks()
      
      const itunesOrchestrator = new WorkflowOrchestrator({ enableItunesIntegration: true })
      await itunesOrchestrator.initialize()

      const filePath = '/path/to/test.txt'
      const eventSpy = jest.fn()
      itunesOrchestrator.on('file:completed', eventSpy)

      const result = await itunesOrchestrator.processSingleFile(filePath)

      expect(result.success).toBe(true)
      expect(result.path).toBe(filePath)
      expect(result.steps.textExtraction.content).toBe('Sample text content')
      expect(result.steps.audioConversion.audioPath).toBe('/tmp/audio/test.wav')
      expect(result.steps.itunesImport.trackId).toBe('track-123')
      // Cleanup should be skipped in direct mode (new default)
      expect(result.steps.cleanup.skipped).toBe(true)
      expect(result.steps.cleanup.reason).toBe('Direct output mode - no temp files to clean')

      expect(mockFileProcessor.extractText).toHaveBeenCalledWith(filePath)
      expect(mockAudioConverter.convertToAudio).toHaveBeenCalled()
      expect(mockITunesManager.importAudioFile).toHaveBeenCalled()
      expect(mockAudioConverter.cleanup).not.toHaveBeenCalled()

      expect(eventSpy).toHaveBeenCalledWith({
        filePath,
        result: expect.objectContaining({ success: true })
      })
    })

    test('should handle file processing failure with continue on error', async () => {
      const filePath = '/path/to/test.txt'
      const error = new Error('TTS conversion failed')
      mockAudioConverter.convertToAudio.mockRejectedValue(error)

      const eventSpy = jest.fn()
      orchestrator.on('file:failed', eventSpy)

      const result = await orchestrator.processSingleFile(filePath)

      expect(result.success).toBe(false)
      expect(result.error).toBe(error)
      expect(eventSpy).toHaveBeenCalledWith({
        filePath,
        error,
        step: 'audio-conversion'
      })
    })

    test('should throw error when continueOnError is false', async () => {
      orchestrator.options.continueOnError = false
      const filePath = '/path/to/test.txt'
      const error = new Error('TTS conversion failed')
      mockAudioConverter.convertToAudio.mockRejectedValue(error)

      await expect(orchestrator.processSingleFile(filePath)).rejects.toThrow('TTS conversion failed')
    })

    test('should retry failed operations', async () => {
      orchestrator.options.retryAttempts = 2
      const filePath = '/path/to/test.txt'
      mockAudioConverter.convertToAudio
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({
          audioPath: '/tmp/audio/test.wav',
          metadata: { duration: 60 }
        })

      const retrySpy = jest.fn()
      orchestrator.on('operation:retry', retrySpy)

      const result = await orchestrator.processSingleFile(filePath)

      expect(result.success).toBe(true)
      expect(retrySpy).toHaveBeenCalledWith({
        step: 'audio-conversion',
        attempt: 1
      })
    })
  })

  describe('Batch Processing', () => {
    beforeEach(async () => {
      await orchestrator.initialize()
    })

    test('should process multiple files sequentially', async () => {
      const files = ['/path/to/test1.txt', '/path/to/test2.txt']
      fs.stat.mockResolvedValue({ isFile: () => true, isDirectory: () => false })
      fs.access.mockResolvedValue()

      const progressSpy = jest.fn()
      orchestrator.on('workflow:progress', progressSpy)

      const result = await orchestrator.processFiles(files)

      expect(result.success).toBe(true)
      expect(result.summary.totalFiles).toBe(2)
      expect(result.summary.successfulFiles).toBe(2)
      expect(result.summary.failedFiles).toBe(0)
      expect(result.results).toHaveLength(2)

      expect(progressSpy).toHaveBeenCalledWith({
        processed: expect.any(Number),
        total: 2,
        progress: expect.any(Number)
      })
    })

    test('should process files with concurrency control', async () => {
      const files = ['/path/to/test1.txt', '/path/to/test2.txt', '/path/to/test3.txt', '/path/to/test4.txt']
      orchestrator.options.concurrency = 2

      fs.stat.mockResolvedValue({ isFile: () => true, isDirectory: () => false })
      fs.access.mockResolvedValue()

      // Track order of processing starts
      const processingOrder = []
      const originalProcessSingle = orchestrator.processSingleFile.bind(orchestrator)
      orchestrator.processSingleFile = jest.fn().mockImplementation(async (filePath) => {
        processingOrder.push(filePath)
        // Add delay to simulate processing time
        await new Promise(resolve => setTimeout(resolve, 10))
        return await originalProcessSingle(filePath)
      })

      const result = await orchestrator.processFiles(files)

      expect(result.success).toBe(true)
      expect(result.summary.totalFiles).toBe(4)
      expect(orchestrator.processSingleFile).toHaveBeenCalledTimes(4)

      // Verify that files were processed in chunks
      expect(processingOrder).toHaveLength(4)
    })

    test('should handle partial failures in batch processing', async () => {
      const files = ['/path/to/test1.txt', '/path/to/test2.txt', '/path/to/test3.txt']
      fs.stat.mockResolvedValue({ isFile: () => true, isDirectory: () => false })
      fs.access.mockResolvedValue()

      // Reset the mock to ensure clean state
      mockAudioConverter.convertToAudio.mockReset()

      // Make second file fail
      mockAudioConverter.convertToAudio
        .mockResolvedValueOnce({ audioPath: '/tmp/audio/test1.wav', metadata: {} })
        .mockRejectedValueOnce(new Error('Conversion failed'))
        .mockResolvedValueOnce({ audioPath: '/tmp/audio/test3.wav', metadata: {} })

      const result = await orchestrator.processFiles(files)

      expect(result.success).toBe(true)
      expect(result.summary.totalFiles).toBe(3)
      expect(result.summary.successfulFiles).toBe(2)
      expect(result.summary.failedFiles).toBe(1)
    })
  })

  describe('Workflow Control', () => {
    beforeEach(async () => {
      await orchestrator.initialize()
    })

    test('should get current workflow state', () => {
      orchestrator.state.totalFiles = 10
      orchestrator.state.processedFiles = 3
      orchestrator.state.startTime = new Date()

      const state = orchestrator.getState()

      expect(state.totalFiles).toBe(10)
      expect(state.processedFiles).toBe(3)
      expect(state.progress).toBe(0.3)
      expect(state.componentsStatus).toBeDefined()
    })

    test('should pause and resume workflow', async () => {
      orchestrator.state.status = 'running'

      const pauseResult = await orchestrator.pause()
      expect(pauseResult.success).toBe(true)
      expect(orchestrator.state.status).toBe('paused')

      const resumeResult = await orchestrator.resume()
      expect(resumeResult.success).toBe(true)
      expect(orchestrator.state.status).toBe('running')
    })

    test('should stop workflow and cleanup', async () => {
      orchestrator.state.status = 'running'

      const stopResult = await orchestrator.stop()

      expect(stopResult.success).toBe(true)
      expect(orchestrator.state.status).toBe('stopped')
      expect(mockAudioConverter.cleanupAll).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    beforeEach(async () => {
      await orchestrator.initialize()
    })

    test('should emit workflow error on initialization failure', async () => {
      const newOrchestrator = new WorkflowOrchestrator()
      mockFileProcessor.initialize.mockRejectedValue(new Error('Init failed'))
      FileProcessor.mockImplementation(() => mockFileProcessor)

      const errorSpy = jest.fn()
      newOrchestrator.on('workflow:error', errorSpy)

      await expect(newOrchestrator.initialize()).rejects.toThrow()
      expect(errorSpy).toHaveBeenCalledWith({
        phase: 'initialization',
        error: expect.any(Error)
      })
    })

    test('should require initialization before processing', async () => {
      const newOrchestrator = new WorkflowOrchestrator()

      await expect(newOrchestrator.processFiles(['/test.txt'])).rejects.toThrow('Workflow not initialized')
    })

    test('should handle file discovery errors', async () => {
      fs.stat.mockRejectedValue(new Error('File system error'))

      const errorSpy = jest.fn()
      orchestrator.on('workflow:error', errorSpy)

      await expect(orchestrator._discoverFiles('/invalid/path')).rejects.toThrow('File discovery failed')
      expect(errorSpy).toHaveBeenCalledWith({
        phase: 'file-discovery',
        error: expect.any(Error)
      })
    })
  })

  describe('Helper Methods', () => {
    test('should chunk array correctly', () => {
      const array = [1, 2, 3, 4, 5, 6, 7]
      const chunks = orchestrator._chunkArray(array, 3)

      expect(chunks).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7]
      ])
    })

    test('should handle empty array chunking', () => {
      const chunks = orchestrator._chunkArray([], 3)
      expect(chunks).toEqual([])
    })

    test('should handle chunk size larger than array', () => {
      const array = [1, 2]
      const chunks = orchestrator._chunkArray(array, 5)

      expect(chunks).toEqual([[1, 2]])
    })
  })

  describe('Event Emission', () => {
    beforeEach(async () => {
      await orchestrator.initialize()
    })

    test('should emit workflow events', async () => {
      const files = ['/path/to/test.txt']
      fs.stat.mockResolvedValue({ isFile: () => true, isDirectory: () => false })
      fs.access.mockResolvedValue()

      const startedSpy = jest.fn()
      const discoveredSpy = jest.fn()
      const completedSpy = jest.fn()

      orchestrator.on('workflow:started', startedSpy)
      orchestrator.on('workflow:files-discovered', discoveredSpy)
      orchestrator.on('workflow:completed', completedSpy)

      await orchestrator.processFiles(files)

      expect(startedSpy).toHaveBeenCalledWith({ input: files, options: {} })
      expect(discoveredSpy).toHaveBeenCalledWith({ count: 1, files: ['/path/to/test.txt'] })
      expect(completedSpy).toHaveBeenCalledWith({
        summary: expect.any(Object),
        results: expect.any(Array)
      })
    })
  })
})
