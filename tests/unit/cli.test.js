/**
 * Unit tests for TT3 CLI
 * Tests command parsing, progress display, and integration with WorkflowOrchestrator
 */

// Mock all dependencies before imports
jest.mock('../../src/core/workflow-orchestrator')
jest.mock('fs-extra')
jest.mock('ora')
jest.mock('chalk', () => {
  const mockChain = jest.fn(s => s)
  mockChain.bold = jest.fn(s => s)

  return {
    blue: Object.assign(jest.fn(s => s), { bold: jest.fn(s => s) }),
    green: Object.assign(jest.fn(s => s), { bold: jest.fn(s => s) }),
    red: Object.assign(jest.fn(s => s), { bold: jest.fn(s => s) }),
    yellow: Object.assign(jest.fn(s => s), { bold: jest.fn(s => s) }),
    gray: jest.fn(s => s)
  }
})

const TT3CLI = require('../../src/interfaces/cli')
const WorkflowOrchestrator = require('../../src/core/workflow-orchestrator')
const fs = require('fs-extra')
const ora = require('ora')

// Mock process methods
const originalExit = process.exit
const originalConsoleLog = console.log
const originalConsoleError = console.error

describe('TT3CLI', () => {
  let cli
  let mockOrchestrator
  let consoleOutput
  let consoleErrors
  let mockSpinner

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock console methods to capture output
    consoleOutput = []
    consoleErrors = []
    console.log = jest.fn((...args) => consoleOutput.push(args.join(' ')))
    console.error = jest.fn((...args) => consoleErrors.push(args.join(' ')))

    // Mock process.exit to throw instead of exiting
    process.exit = jest.fn((code) => {
      throw new Error(`Process exit with code ${code}`)
    })

    // Mock ora spinner
    mockSpinner = {
      start: jest.fn().mockReturnThis(),
      stop: jest.fn().mockReturnThis(),
      succeed: jest.fn().mockReturnThis(),
      fail: jest.fn().mockReturnThis()
    }
    ora.mockReturnValue(mockSpinner)

    // Mock WorkflowOrchestrator
    mockOrchestrator = {
      initialize: jest.fn().mockResolvedValue(),
      processFiles: jest.fn().mockResolvedValue({
        success: true,
        summary: {
          totalFiles: 2,
          successfulFiles: 2,
          failedFiles: 0,
          processingTime: 5000
        },
        results: [
          {
            success: true,
            path: '/test/file1.txt',
            steps: {
              itunesImport: { trackId: 'track-1' },
              audioConversion: { metadata: { duration: 30 } }
            }
          },
          {
            success: true,
            path: '/test/file2.txt',
            steps: {
              itunesImport: { trackId: 'track-2' },
              audioConversion: { metadata: { duration: 45 } }
            }
          }
        ]
      }),
      _discoverFiles: jest.fn().mockResolvedValue(['/test/file1.txt', '/test/file2.txt']),
      getState: jest.fn().mockReturnValue({
        componentsStatus: {
          FileProcessor: { ready: true },
          TTSService: { ready: true },
          AudioConverter: { ready: true },
          ITunesManager: { ready: true }
        }
      }),
      on: jest.fn()
    }
    WorkflowOrchestrator.mockImplementation(() => mockOrchestrator)

    // Mock fs-extra
    fs.pathExists = jest.fn().mockResolvedValue(true)

    cli = new TT3CLI()
  })

  afterEach(() => {
    // Restore original methods
    console.log = originalConsoleLog
    console.error = originalConsoleError
    process.exit = originalExit
  })

  describe('Constructor and Setup', () => {
    test('should create CLI with proper command structure', () => {
      expect(cli.program).toBeDefined()
      expect(cli.orchestrator).toBeNull()
      expect(cli.currentSpinner).toBeNull()
    })

    test('should register process command with correct options', () => {
      const commands = cli.program.commands.map(cmd => cmd.name())
      expect(commands).toContain('process')
      expect(commands).toContain('status')
      expect(commands).toContain('version')
    })
  })

  describe('Process Command', () => {
    test('should process files successfully with default options', async () => {
      const mockArgv = ['node', 'cli.js', 'process', '/test/directory']

      await cli.program.parseAsync(mockArgv)

      expect(fs.pathExists).toHaveBeenCalledWith(expect.stringContaining('/test/directory'))
      expect(WorkflowOrchestrator).toHaveBeenCalledWith({
        concurrency: 1,
        continueOnError: true,
        retryAttempts: 2
      })
      expect(mockOrchestrator.initialize).toHaveBeenCalled()
      expect(mockOrchestrator.processFiles).toHaveBeenCalledWith('/test/directory', expect.any(Object))
    })

    test('should handle custom concurrency option', async () => {
      const mockArgv = ['node', 'cli.js', 'process', '/test/directory', '--concurrency', '3']

      await cli.program.parseAsync(mockArgv)

      expect(WorkflowOrchestrator).toHaveBeenCalledWith({
        concurrency: 3,
        continueOnError: true,
        retryAttempts: 2
      })
    })

    test('should handle --no-continue-on-error flag', async () => {
      const mockArgv = ['node', 'cli.js', 'process', '/test/directory', '--no-continue-on-error']

      await cli.program.parseAsync(mockArgv)

      expect(WorkflowOrchestrator).toHaveBeenCalledWith({
        concurrency: 1,
        continueOnError: false,
        retryAttempts: 2
      })
    })

    test('should handle non-existent input path', async () => {
      fs.pathExists.mockResolvedValue(false)
      const mockArgv = ['node', 'cli.js', 'process', '/nonexistent/path']

      await expect(cli.program.parseAsync(mockArgv)).rejects.toThrow('Process exit with code 1')
      expect(consoleErrors.some(err => err.includes('Input path does not exist'))).toBe(true)
    })

    test('should handle initialization failure', async () => {
      mockOrchestrator.initialize.mockRejectedValue(new Error('TTS init failed'))
      const mockArgv = ['node', 'cli.js', 'process', '/test/directory']

      await expect(cli.program.parseAsync(mockArgv)).rejects.toThrow('Process exit with code 1')
      expect(mockSpinner.fail).toHaveBeenCalledWith('Initialization failed: TTS init failed')
    })

    test('should display verbose output when requested', async () => {
      const mockArgv = ['node', 'cli.js', 'process', '/test/directory', '--verbose']

      await cli.program.parseAsync(mockArgv)

      // Should setup verbose listeners
      expect(mockOrchestrator.on).toHaveBeenCalledWith('workflow:started', expect.any(Function))
      expect(mockOrchestrator.on).toHaveBeenCalledWith('file:started', expect.any(Function))
    })
  })

  describe('Dry Run Mode', () => {
    test('should perform dry run without processing files', async () => {
      const mockArgv = ['node', 'cli.js', 'process', '/test/directory', '--dry-run']

      await cli.program.parseAsync(mockArgv)

      expect(mockOrchestrator.initialize).toHaveBeenCalled()
      expect(mockOrchestrator._discoverFiles).toHaveBeenCalledWith('/test/directory')
      expect(mockOrchestrator.processFiles).not.toHaveBeenCalled()

      expect(consoleOutput.some(out => out.includes('Files that would be processed'))).toBe(true)
      expect(consoleOutput.some(out => out.includes('file1.txt'))).toBe(true)
      expect(consoleOutput.some(out => out.includes('file2.txt'))).toBe(true)
    })

    test('should handle dry run with no files found', async () => {
      mockOrchestrator._discoverFiles.mockResolvedValue([])
      const mockArgv = ['node', 'cli.js', 'process', '/test/directory', '--dry-run']

      await cli.program.parseAsync(mockArgv)

      expect(consoleOutput.some(out => out.includes('No .txt or .md files found'))).toBe(true)
    })
  })

  describe('Status Command', () => {
    test('should check system status successfully', async () => {
      const mockArgv = ['node', 'cli.js', 'status']

      await cli.program.parseAsync(mockArgv)

      expect(mockOrchestrator.initialize).toHaveBeenCalled()
      expect(mockSpinner.succeed).toHaveBeenCalledWith('All components operational')
      expect(consoleOutput.some(out => out.includes('System is ready to process files'))).toBe(true)
    })

    test('should show verbose component status', async () => {
      const mockArgv = ['node', 'cli.js', 'status', '--verbose']

      await cli.program.parseAsync(mockArgv)

      expect(mockOrchestrator.getState).toHaveBeenCalled()
      expect(consoleOutput.some(out => out.includes('Component Status'))).toBe(true)
      expect(consoleOutput.some(out => out.includes('FileProcessor'))).toBe(true)
    })

    test('should handle status check failure', async () => {
      mockOrchestrator.initialize.mockRejectedValue(new Error('Component failure'))
      const mockArgv = ['node', 'cli.js', 'status']

      await cli.program.parseAsync(mockArgv)

      expect(mockSpinner.fail).toHaveBeenCalledWith('Component check failed: Component failure')
      expect(consoleOutput.some(out => out.includes('Troubleshooting'))).toBe(true)
    })
  })

  describe('Version Command', () => {
    test('should display version and system information', async () => {
      const mockArgv = ['node', 'cli.js', 'version']

      await cli.program.parseAsync(mockArgv)

      expect(consoleOutput.some(out => out.includes('TT3 - News Audio Converter'))).toBe(true)
      expect(consoleOutput.some(out => out.includes('System Information'))).toBe(true)
      expect(consoleOutput.some(out => out.includes('Features'))).toBe(true)
      expect(consoleOutput.some(out => out.includes('Local TTS with chunking'))).toBe(true)
    })
  })

  describe('Progress Event Handling', () => {
    test('should setup progress listeners correctly', () => {
      // Initialize orchestrator first
      cli.orchestrator = mockOrchestrator
      cli.setupProgressListeners(false)

      expect(mockOrchestrator.on).toHaveBeenCalledWith('workflow:started', expect.any(Function))
      expect(mockOrchestrator.on).toHaveBeenCalledWith('workflow:files-discovered', expect.any(Function))
      expect(mockOrchestrator.on).toHaveBeenCalledWith('workflow:progress', expect.any(Function))
      expect(mockOrchestrator.on).toHaveBeenCalledWith('file:completed', expect.any(Function))
      expect(mockOrchestrator.on).toHaveBeenCalledWith('file:failed', expect.any(Function))
      expect(mockOrchestrator.on).toHaveBeenCalledWith('workflow:completed', expect.any(Function))
    })

    test('should handle files discovered event', () => {
      // Initialize orchestrator first
      cli.orchestrator = mockOrchestrator
      cli.setupProgressListeners(false)

      // Find the files discovered callback
      const filesDiscoveredCall = mockOrchestrator.on.mock.calls.find(
        call => call[0] === 'workflow:files-discovered'
      )
      const callback = filesDiscoveredCall[1]

      // Simulate event
      callback({ count: 3, files: ['/test/file1.txt', '/test/file2.txt', '/test/file3.txt'] })

      expect(consoleOutput.some(out => out.includes('Discovered 3 files'))).toBe(true)
    })

    test('should handle workflow progress event', () => {
      // Initialize orchestrator first
      cli.orchestrator = mockOrchestrator
      cli.setupProgressListeners(false)

      // Find the progress callback
      const progressCall = mockOrchestrator.on.mock.calls.find(
        call => call[0] === 'workflow:progress'
      )
      const callback = progressCall[1]

      // Simulate event
      callback({ processed: 2, total: 5, progress: 0.4 })

      expect(ora).toHaveBeenCalledWith('Processing files: 2/5 (40%)')
    })

    test('should handle file failed event', () => {
      // Initialize orchestrator first
      cli.orchestrator = mockOrchestrator
      cli.setupProgressListeners(false)

      // Find the file failed callback
      const fileFailedCall = mockOrchestrator.on.mock.calls.find(
        call => call[0] === 'file:failed'
      )
      const callback = fileFailedCall[1]

      // Simulate event
      callback({
        filePath: '/test/failed-file.txt',
        error: new Error('TTS conversion failed')
      })

      expect(consoleOutput.some(out => out.includes('❌ Failed:'))).toBe(true)
    })
  })

  describe('Results Display', () => {
    test('should display successful processing results', () => {
      const mockResult = {
        summary: {
          totalFiles: 3,
          successfulFiles: 2,
          failedFiles: 1,
          processingTime: 8500
        },
        results: [
          { success: true, path: '/test/file1.txt', steps: { itunesImport: { trackId: 'track-1' } } },
          { success: true, path: '/test/file2.txt', steps: { itunesImport: { trackId: 'track-2' } } },
          { success: false, path: '/test/file3.txt', error: new Error('Processing failed') }
        ]
      }

      cli.displayResults(mockResult, false)

      expect(consoleOutput.some(out => out.includes('Processing Complete'))).toBe(true)
      expect(consoleOutput.some(out => out.includes('Total Files: 3'))).toBe(true)
      expect(consoleOutput.some(out => out.includes('Successful: 2'))).toBe(true)
      expect(consoleOutput.some(out => out.includes('Failed: 1'))).toBe(true)
      expect(consoleOutput.some(out => out.includes('Processing Time: 9s'))).toBe(true)
    })

    test('should display verbose results with audio details', () => {
      const mockResult = {
        summary: {
          totalFiles: 1,
          successfulFiles: 1,
          failedFiles: 0,
          processingTime: 3000
        },
        results: [
          {
            success: true,
            path: '/test/file1.txt',
            steps: {
              itunesImport: { trackId: 'track-1' },
              audioConversion: { metadata: { duration: 120 } }
            }
          }
        ]
      }

      cli.displayResults(mockResult, true)

      expect(consoleOutput.some(out => out.includes('Added to iTunes playlist'))).toBe(true)
      expect(consoleOutput.some(out => out.includes('Audio duration: 120s'))).toBe(true)
    })

    test('should display failed file details', () => {
      const mockResult = {
        summary: {
          totalFiles: 1,
          successfulFiles: 0,
          failedFiles: 1,
          processingTime: 1000
        },
        results: [
          {
            success: false,
            path: '/test/failed-file.txt',
            error: new Error('TTS service unavailable')
          }
        ]
      }

      cli.displayResults(mockResult, false)

      expect(consoleOutput.some(out => out.includes('Failed Files'))).toBe(true)
      expect(consoleOutput.some(out => out.includes('failed-file.txt'))).toBe(true)
      expect(consoleOutput.some(out => out.includes('TTS service unavailable'))).toBe(true)
    })
  })

  describe('Error Handling', () => {
    test('should handle processing errors gracefully', async () => {
      mockOrchestrator.processFiles.mockRejectedValue(new Error('Processing system failure'))
      const mockArgv = ['node', 'cli.js', 'process', '/test/directory']

      await expect(cli.program.parseAsync(mockArgv)).rejects.toThrow('Process exit with code 1')
      expect(consoleErrors.some(err => err.includes('Processing failed'))).toBe(true)
    })

    test('should log debug messages in verbose mode', () => {
      cli.log('Test debug message', true)
      expect(consoleOutput.some(out => out.includes('[DEBUG] Test debug message'))).toBe(true)
    })

    test('should not log debug messages in non-verbose mode', () => {
      cli.log('Test debug message', false)
      expect(consoleOutput.some(out => out.includes('[DEBUG] Test debug message'))).toBe(false)
    })

    test('should display error messages with proper formatting', () => {
      cli.error('Test error message')
      expect(consoleErrors.some(err => err.includes('❌ Error: Test error message'))).toBe(true)
    })
  })

  describe('Help and Default Behavior', () => {
    test('should show help when no command provided', async () => {
      // Mock the help method
      cli.program.help = jest.fn()
      const mockArgv = ['node', 'cli.js']

      await cli.program.parseAsync(mockArgv)

      expect(cli.program.help).toHaveBeenCalled()
    })
  })
})
