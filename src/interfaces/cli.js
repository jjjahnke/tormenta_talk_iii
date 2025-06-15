#!/usr/bin/env node

/**
 * TT3 - News Audio Converter CLI
 *
 * Command-line interface for converting text files to audio and importing to iTunes
 * Uses the complete WorkflowOrchestrator for end-to-end processing
 */

const { Command } = require('commander')
const chalk = require('chalk')
const ora = require('ora')
const path = require('path')
const fs = require('fs-extra')

// Import our core processing engine
const WorkflowOrchestrator = require('../core/workflow-orchestrator')

// CLI version and metadata
const packageJson = require('../../package.json')

class TT3CLI {
  constructor () {
    this.program = new Command()
    this.orchestrator = null
    this.currentSpinner = null
    this.setupCommands()
  }

  setupCommands () {
    this.program
      .name('tt3')
      .description('TT3 - Convert newspaper articles to audio and import to iTunes')
      .version(packageJson.version)
      .helpOption('-h, --help', 'Display help for command')

    // Main process command
    this.program
      .command('process')
      .description('Process text files to audio with optional iTunes import')
      .argument('<input>', 'Input file or directory path containing .txt/.md files')
      .option('-v, --verbose', 'Enable verbose logging for troubleshooting')
      .option('-c, --concurrency <number>', 'Number of files to process concurrently', '1')
      .option('--continue-on-error', 'Continue processing other files if one fails', true)
      .option('--no-continue-on-error', 'Stop processing if any file fails')
      .option('--retry-attempts <number>', 'Number of retry attempts for failed operations', '2')
      .option('--itunes', 'Enable iTunes playlist integration (optional)')
      .option('--overwrite', 'Overwrite existing audio files instead of creating numbered versions')
      .option('--dry-run', 'Preview files that would be processed without actual conversion')
      .action(this.handleProcessCommand.bind(this))

    // Status command
    this.program
      .command('status')
      .description('Check system status and component readiness')
      .option('-v, --verbose', 'Show detailed component information')
      .action(this.handleStatusCommand.bind(this))

    // Version command override for detailed info
    this.program
      .command('version')
      .description('Show detailed version and system information')
      .action(this.handleVersionCommand.bind(this))

    // Set default command to show help
    this.program.action(() => {
      this.program.help()
    })
  }

  async handleProcessCommand (input, options) {
    try {
      console.log(chalk.blue.bold('🎵 TT3 - News Audio Converter'))
      console.log(chalk.gray(`Processing: ${input}\n`))

      // Validate input path
      const inputPath = path.resolve(input)
      if (!await fs.pathExists(inputPath)) {
        this.error(`Input path does not exist: ${inputPath}`)
        process.exit(1)
      }

      // Initialize orchestrator with CLI options
      const orchestratorOptions = {
        concurrency: parseInt(options.concurrency, 10),
        continueOnError: options.continueOnError,
        retryAttempts: parseInt(options.retryAttempts, 10),
        enableItunesIntegration: options.itunes || false,
        overwriteExisting: options.overwrite || false,
        outputMode: 'direct' // Always use direct output mode for CLI
      }

      this.orchestrator = new WorkflowOrchestrator(orchestratorOptions)

      // Setup event listeners for progress feedback
      this.setupProgressListeners(options.verbose)

      // Initialize the orchestrator
      this.log('Initializing system components...', options.verbose)
      const initMessage = options.itunes
        ? 'Initializing TTS engine, iTunes integration, and file processing...'
        : 'Initializing TTS engine and file processing...'
      const initSpinner = ora(initMessage).start()

      try {
        await this.orchestrator.initialize()
        initSpinner.succeed('System components initialized successfully')
      } catch (error) {
        initSpinner.fail(`Initialization failed: ${error.message}`)
        if (options.verbose) {
          console.error(chalk.red(error.stack))
        }
        process.exit(1)
      }

      // Dry run mode - just discover and show files
      if (options.dryRun) {
        await this.handleDryRun(inputPath, options)
        return
      }

      // Process files
      this.log('Starting file processing...', options.verbose)
      const result = await this.orchestrator.processFiles(inputPath, orchestratorOptions)

      // Display final results
      this.displayResults(result, options.verbose, options.itunes)
    } catch (error) {
      this.error(`Processing failed: ${error.message}`)
      if (options.verbose) {
        console.error(chalk.red(error.stack))
      }
      process.exit(1)
    }
  }

  async handleDryRun (inputPath, options) {
    try {
      this.log('🔍 Dry run mode - discovering files...', options.verbose)

      // Use orchestrator's file discovery
      const files = await this.orchestrator._discoverFiles(inputPath)

      console.log(chalk.yellow.bold(`\n📋 Files that would be processed (${files.length} total):`))

      if (files.length === 0) {
        console.log(chalk.gray('  No .txt or .md files found'))
      } else {
        files.forEach((file, index) => {
          const relativePath = path.relative(process.cwd(), file)
          console.log(chalk.gray(`  ${index + 1}. ${relativePath}`))
        })
      }

      console.log(chalk.blue('\n💡 Run without --dry-run to process these files'))
    } catch (error) {
      this.error(`File discovery failed: ${error.message}`)
      if (options.verbose) {
        console.error(chalk.red(error.stack))
      }
    }
  }

  async handleStatusCommand (options) {
    try {
      console.log(chalk.blue.bold('🎵 TT3 - System Status\n'))

      // Initialize orchestrator to check component status
      this.orchestrator = new WorkflowOrchestrator()

      const statusSpinner = ora('Checking system components...').start()

      try {
        await this.orchestrator.initialize()
        statusSpinner.succeed('All components operational')

        if (options.verbose) {
          const state = this.orchestrator.getState()
          console.log('\n📊 Component Status:')

          if (state.componentsStatus) {
            Object.entries(state.componentsStatus).forEach(([component, status]) => {
              const statusIcon = status.ready ? '✅' : '❌'
              console.log(`  ${statusIcon} ${component}: ${status.ready ? 'Ready' : 'Not Ready'}`)
            })
          }
        }

        console.log(chalk.green('\n🎉 System is ready to process files!'))
        console.log(chalk.gray('  Run: tt3 process <directory> to start converting articles'))
      } catch (error) {
        statusSpinner.fail(`Component check failed: ${error.message}`)

        if (options.verbose) {
          console.error(chalk.red('\n📋 Detailed Error Information:'))
          console.error(chalk.red(error.stack))
        }

        console.log(chalk.yellow('\n🔧 Troubleshooting:'))
        console.log(chalk.gray('  • Ensure macOS Music app is available (for iTunes integration)'))
        console.log(chalk.gray('  • Check that text-to-speech is working: "say hello" in Terminal'))
        console.log(chalk.gray('  • Run with --verbose for detailed error information'))
      }
    } catch (error) {
      this.error(`Status check failed: ${error.message}`)
    }
  }

  handleVersionCommand () {
    console.log(chalk.blue.bold(`🎵 TT3 - News Audio Converter v${packageJson.version}\n`))

    console.log('📦 System Information:')
    console.log(`  Node.js: ${process.version}`)
    console.log(`  Platform: ${process.platform} ${process.arch}`)
    console.log(`  Working Directory: ${process.cwd()}`)

    console.log('\n🚀 Features:')
    console.log('  ✅ Local TTS with chunking for long articles (3,600+ words)')
    console.log('  ✅ Cross-platform support (macOS, Windows, Linux)')
    console.log('  ✅ iTunes/Music app integration with playlist automation')
    console.log('  ✅ Batch processing with concurrency control')
    console.log('  ✅ Comprehensive error handling and retry mechanisms')

    console.log('\n📚 Documentation:')
    console.log(`  Repository: ${packageJson.repository.url}`)
    console.log('  Issues: https://github.com/jjjahnke/tormenta_talk_iii/issues')
  }

  setupProgressListeners (verbose) {
    // Workflow started
    this.orchestrator.on('workflow:started', (data) => {
      if (verbose) {
        this.log(`Workflow started with input: ${JSON.stringify(data.input)}`, verbose)
      }
    })

    // Files discovered
    this.orchestrator.on('workflow:files-discovered', (data) => {
      console.log(chalk.blue(`📁 Discovered ${data.count} files to process`))
      if (verbose && data.files.length <= 10) {
        data.files.forEach((file, index) => {
          const relativePath = path.relative(process.cwd(), file)
          console.log(chalk.gray(`  ${index + 1}. ${relativePath}`))
        })
      } else if (verbose && data.files.length > 10) {
        console.log(chalk.gray('  First 10 files:'))
        data.files.slice(0, 10).forEach((file, index) => {
          const relativePath = path.relative(process.cwd(), file)
          console.log(chalk.gray(`  ${index + 1}. ${relativePath}`))
        })
        console.log(chalk.gray(`  ... and ${data.files.length - 10} more files`))
      }
    })

    // Overall progress
    this.orchestrator.on('workflow:progress', (data) => {
      if (this.currentSpinner) {
        this.currentSpinner.stop()
      }

      const progressPercent = Math.round(data.progress * 100)
      this.currentSpinner = ora(`Processing files: ${data.processed}/${data.total} (${progressPercent}%)`).start()
    })

    // Individual file events
    this.orchestrator.on('file:started', (data) => {
      if (verbose) {
        const relativePath = path.relative(process.cwd(), data.filePath)
        this.log(`Starting: ${relativePath}`, verbose)
      }
    })

    this.orchestrator.on('file:completed', (data) => {
      const relativePath = path.relative(process.cwd(), data.filePath)
      if (verbose) {
        this.log(`✅ Completed: ${relativePath}`, verbose)
      }
    })

    this.orchestrator.on('file:failed', (data) => {
      const relativePath = path.relative(process.cwd(), data.filePath)
      console.log(chalk.red(`❌ Failed: ${relativePath} - ${data.error.message}`))
      if (verbose) {
        console.error(chalk.red(`   Details: ${data.error.stack}`))
      }
    })

    this.orchestrator.on('file:warning', (data) => {
      const relativePath = path.relative(process.cwd(), data.filePath)
      console.log(chalk.yellow(`⚠️  Warning: ${relativePath} - ${data.reason}`))
    })

    // Operation retries
    this.orchestrator.on('operation:retry', (data) => {
      if (verbose) {
        this.log(`Retrying ${data.step} (attempt ${data.attempt + 1})`, verbose)
      }
    })

    // Workflow completion
    this.orchestrator.on('workflow:completed', (data) => {
      if (this.currentSpinner) {
        this.currentSpinner.succeed('Processing completed')
      }
    })

    // Workflow errors
    this.orchestrator.on('workflow:error', (data) => {
      if (this.currentSpinner) {
        this.currentSpinner.fail(`Error in ${data.phase}: ${data.error.message}`)
      }
    })
  }

  displayResults (result, verbose, itunesEnabled = false) {
    console.log(chalk.green.bold('\n🎉 Processing Complete!\n'))

    // Summary statistics
    console.log('📊 Summary:')
    console.log(`  Total Files: ${result.summary.totalFiles}`)
    console.log(`  Successful: ${chalk.green(result.summary.successfulFiles)}`)
    console.log(`  Failed: ${chalk.red(result.summary.failedFiles)}`)
    console.log(`  Processing Time: ${Math.round(result.summary.processingTime / 1000)}s`)

    // Success details
    if (result.summary.successfulFiles > 0) {
      console.log(chalk.green('\n✅ Successfully Processed:'))
      result.results
        .filter(r => r.success)
        .forEach((fileResult, index) => {
          const relativePath = path.relative(process.cwd(), fileResult.path)
          console.log(`  ${index + 1}. ${relativePath}`)

          if (verbose && fileResult.steps) {
            if (fileResult.steps.itunesImport && fileResult.steps.itunesImport.trackId) {
              console.log(chalk.gray(`     → Added to iTunes playlist: ${fileResult.steps.itunesImport.trackId}`))
            }
            if (fileResult.steps.audioConversion && fileResult.steps.audioConversion.metadata) {
              const duration = fileResult.steps.audioConversion.metadata.duration
              if (duration) {
                console.log(chalk.gray(`     → Audio duration: ${Math.round(duration)}s`))
              }
            }
          }
        })
    }

    // Failure details
    if (result.summary.failedFiles > 0) {
      console.log(chalk.red('\n❌ Failed Files:'))
      result.results
        .filter(r => !r.success)
        .forEach((fileResult, index) => {
          const relativePath = path.relative(process.cwd(), fileResult.path)
          console.log(`  ${index + 1}. ${relativePath}`)
          console.log(chalk.gray(`     → ${fileResult.error.message}`))
        })
    }

    // Next steps
    if (result.summary.successfulFiles > 0) {
      console.log(chalk.blue('\n🎵 Next Steps:'))
      if (itunesEnabled) {
        console.log('  • Open iTunes/Music app to see your "News-YYYY-MM-DD" playlist')
        console.log('  • Sync your iPhone to get the audio files for offline listening')
      } else {
        console.log('  • Audio files saved alongside your source text files')
        console.log('  • Use --itunes flag to enable iTunes playlist integration')
      }
      console.log('  • Articles are ready for hands-free consumption!')
    }
  }

  log (message, verbose) {
    if (verbose) {
      console.log(chalk.gray(`[DEBUG] ${message}`))
    }
  }

  error (message) {
    console.error(chalk.red.bold(`❌ Error: ${message}`))
  }

  async run () {
    try {
      await this.program.parseAsync(process.argv)
    } catch (error) {
      this.error(error.message)
      process.exit(1)
    }
  }
}

// Handle uncaught errors gracefully
process.on('uncaughtException', (error) => {
  console.error(chalk.red.bold('❌ Unexpected error occurred:'))
  console.error(chalk.red(error.message))
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red.bold('❌ Unhandled promise rejection:'))
  console.error(chalk.red(reason))
  process.exit(1)
})

// Exit gracefully on Ctrl+C
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n⏹️  Processing interrupted by user'))
  process.exit(0)
})

// Run the CLI if this file is executed directly
if (require.main === module) {
  const cli = new TT3CLI()
  cli.run()
}

module.exports = TT3CLI
