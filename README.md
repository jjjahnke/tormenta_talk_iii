# TT3 - News Audio Converter

A cross-platform application that converts newspaper articles to audio files with optional iTunes integration for hands-free listening.

## 📊 Current Status

**✅ Production Ready** - All features complete with automated distribution

### ✅ Completed Features
- **Local TTS Engine** - Cross-platform text-to-speech with chunking for stability (macOS, Windows, Linux)
- **iTunes Integration** - Optional playlist creation and audio import (--itunes flag)
- **File Processing** - Smart text extraction and preprocessing (.txt/.md support)
- **Audio Processing** - Direct file output alongside source files with conflict resolution
- **Workflow Orchestration** - File discovery and batch processing with concurrency control
- **Command-Line Interface** - Professional CLI with progress display and comprehensive options
- **Desktop Application** - Cross-platform Electron app with drag-and-drop interface, settings management, and TT3 branding
- **Testing Framework** - Comprehensive unit tests (165+ tests passing)
- **Automated Distribution** - GitHub Actions for cross-platform binary releases

### 🎯 Ready to Use
Download pre-built binaries from [Releases](../../releases) or build from source.

### 📈 Progress Details
```bash
npm test           # Run all tests (150+ tests passing)
npm run lint       # Code quality checks
node src/interfaces/cli.js --help  # CLI usage information
npm run dev:desktop  # Launch desktop application
```

## Overview

TT3 (Tormenta Talk v3) automates the conversion of text articles to audio using local text-to-speech libraries. Audio files are saved alongside your source files by default, with optional iTunes playlist creation for seamless iPhone synchronization. The system supports both command-line and desktop drag-and-drop interfaces.

## Key Features

- **Local TTS Processing:** Privacy-focused offline text-to-speech conversion with chunking for long documents
  - ✅ macOS (`say` command) - AIFF output with text chunking to prevent crashes
  - ✅ Windows (SAPI) - WAV output  
  - ✅ Linux (espeak) - WAV output
- **iTunes Integration:** Optional playlist creation with "News-YYYY-MM-DD" naming
  - ✅ AppleScript automation for Music app
  - ✅ Playlist creation/cleanup (2-day retention)  
  - ✅ Audio file import with metadata
  - ✅ Enable via --itunes CLI flag or desktop UI toggle
- **File Processing:** Smart content extraction and direct audio file output
  - ✅ Recursive directory scanning (.txt/.md files)
  - ✅ Markdown formatting cleanup
  - ✅ Text preprocessing for optimal TTS
  - ✅ Audio files saved alongside source files (same directory, same basename)
  - ✅ Automatic filename conflict resolution with sequential numbering
  - ✅ Optional overwrite mode via --overwrite flag
- **Audio Processing:** Temporary file management and format conversion coordination
  - ✅ Cross-platform temporary file management with configurable cleanup
  - ✅ Audio format conversion support (AIFF/MP3/WAV)
  - ✅ File validation and size limits (500MB default)
  - ✅ Metadata generation with source tracking
- **Workflow Orchestration:** Automated processing pipeline with concurrency control
  - ✅ Recursive file discovery with type filtering (.txt/.md)
  - ✅ Batch processing with configurable concurrency
  - ✅ Processing pipeline coordination (File → TTS → Audio → iTunes)
  - ✅ Progress tracking and error handling
- **Cross-Platform:** Works on macOS, Windows, and Linux
- **Dual Interface:** Command-line tool and desktop drag-and-drop application
- **Desktop Application:** Electron-based cross-platform GUI with intuitive drag-and-drop interface
  - ✅ Folder drag-and-drop onto application window
  - ✅ Real-time progress display with file-by-file status
  - ✅ Desktop notifications for completion/error status
  - ✅ Professional TT3 branding and icon design
  - ✅ Cross-platform compatibility (macOS, Windows, Linux)
- **Smart Cleanup:** Automatically removes old playlists and audio files (2-day retention)
- **Progress Feedback:** Real-time processing status and error reporting

## Default Behavior

**Audio File Output:**
- Audio files are saved **directly alongside your source files** (same directory, same basename)
- Example: `article.txt` → `article.aiff` (same folder)
- Automatic filename conflict resolution: `article-1.aiff`, `article-2.aiff`, etc.
- Use `--overwrite` flag to replace existing files instead of creating numbered versions

**iTunes Integration:**
- iTunes playlist creation is **optional** (disabled by default)
- Enable via `--itunes` CLI flag or desktop app settings toggle
- When enabled, creates "News-YYYY-MM-DD" playlists in Music/iTunes app

**Why This Change?**
This new default behavior provides better user control and file organization while maintaining the option for iTunes workflow when desired.

## Architecture

- **Modular Monolith:** Clear internal boundaries for future web service extraction
- **Local TTS:** No external API dependencies, complete offline operation
- **File-Based Processing:** Supports .txt and .md files with extensible content handling
- **Cross-Platform Desktop:** Built with Electron for consistent experience across platforms
- **Privacy-Focused:** All processing happens locally with no external dependencies

## Installation

### Option 1: Download Pre-Built Binaries (Recommended)

**For End Users (No Node.js Required):**

1. Go to the [Releases page](../../releases)
2. Download the appropriate version for your platform:
   - **Windows**: `tt3-desktop-win32-x64-setup.exe` (installer) or `tt3-desktop-win32-x64.zip` (portable)
   - **macOS**: `tt3-desktop-darwin-x64.dmg` (installer) or `tt3-desktop-darwin-x64.zip` (portable)
   - **Linux**: `tt3-desktop-linux-x64.AppImage` (executable) or `tt3-desktop-linux-x64.tar.gz` (archive)
3. Install or extract, then run the TT3 application

**Command-Line Tools:**
- Download `tt3-cli-[platform]-x64` for command-line usage without Node.js installation

### Option 2: Build from Source

**For Developers:**

```bash
# Clone repository
git clone [repository-url]
cd tormenta_talk_iii

# Install dependencies
npm install

# Run tests to verify setup
npm test

# Launch desktop application for development
npm run dev:desktop

# Or use CLI directly
node src/interfaces/cli.js --help
```

**Building Distribution Packages:**
```bash
# Build CLI binaries
npm run build:cli

# Build desktop applications
npm run build:desktop

# Package all platforms
npm run package:all
```

## Quick Start

### Desktop Application (Recommended)

1. **Launch the application:**
   - **Pre-built binary**: Double-click the installed TT3 application
   - **From source**: Run `npm run dev:desktop`

2. **Configure settings** (optional):
   - Toggle iTunes integration on/off
   - Enable/disable file overwrite mode

3. **Process articles:**
   - Drag a folder containing .txt or .md files onto the application window
   - Watch real-time progress as files are converted to audio
   - Audio files will be saved alongside your source files

### Command Line Interface

```bash
# Process articles using CLI (source files)
node src/interfaces/cli.js process /path/to/articles

# Process with iTunes integration enabled
node src/interfaces/cli.js process /path/to/articles --itunes

# Process with file overwrite mode
node src/interfaces/cli.js process /path/to/articles --overwrite

# Check system status
node src/interfaces/cli.js status

# CLI help
node src/interfaces/cli.js --help
```

**Using Pre-built CLI Binary:**
```bash
# Download and use pre-built binary (no Node.js required)
./tt3-cli-[platform]-x64 process /path/to/articles --itunes
```

### CLI Usage Examples

```bash
# Process a single file (saves audio alongside source file)
node src/interfaces/cli.js process article.txt

# Process all files in a directory
node src/interfaces/cli.js process /path/to/articles

# Enable iTunes playlist integration
node src/interfaces/cli.js process /path/to/articles --itunes

# Overwrite existing audio files instead of creating numbered versions
node src/interfaces/cli.js process /path/to/articles --overwrite

# Combine iTunes integration with overwrite mode
node src/interfaces/cli.js process /path/to/articles --itunes --overwrite

# Preview files without processing
node src/interfaces/cli.js process /path/to/articles --dry-run

# Process with verbose logging
node src/interfaces/cli.js process /path/to/articles --verbose

# Custom concurrency and retry settings
node src/interfaces/cli.js process /path/to/articles --concurrency 2 --retry-attempts 3

# Stop on first error (default: continue processing)
node src/interfaces/cli.js process /path/to/articles --no-continue-on-error

# Check system status with component details
node src/interfaces/cli.js status --verbose

# Show version and system information
node src/interfaces/cli.js version
```

### Desktop Application Usage

The desktop application provides an intuitive drag-and-drop interface with configurable settings:

1. **Launch:** Run `npm run dev:desktop` to open the application
2. **Configure Settings:** Toggle iTunes integration and overwrite mode in settings
3. **Select Files:** Either:
   - Drag a folder containing articles onto the application window
   - Click "Select Folder" to browse for a directory
4. **Process:** Click "Start Processing" to begin conversion
5. **Monitor:** Watch real-time progress with file-by-file status updates
6. **Complete:** Receive desktop notification when processing finishes

**Features:**
- **Drag-and-Drop:** Intuitive folder selection by dragging onto the app window
- **Settings Management:** Toggle iTunes integration and overwrite mode with persistent storage
- **Progress Display:** Real-time file-by-file progress with visual indicators
- **Error Handling:** Clear error messages for failed conversions with dismiss options
- **Desktop Notifications:** System notifications for completion status
- **Professional UI:** Modern gradient design with TT3 branding
- **Cross-Platform:** Consistent experience on macOS, Windows, and Linux

## Development & Testing

```bash
# Run full test suite
npm test

# Test integration workflow
node test-integration.js

# Development
npm run lint    # Check code quality
npm run test:watch  # Watch mode for tests
npm run dev:desktop  # Desktop app development mode
```

## Core Components

### 🎯 Implemented Modules
- **`src/core/tts-service.js`** - Cross-platform TTS engine with text preprocessing and chunking
- **`src/core/itunes-manager.js`** - Music app integration via AppleScript
- **`src/core/file-processor.js`** - Text file discovery and content extraction
- **`src/core/audio-converter.js`** - Audio processing coordination and temporary file management
- **`src/core/workflow-orchestrator.js`** - File discovery and batch processing pipeline
- **`src/interfaces/cli.js`** - Command-line interface with comprehensive options
- **`src/interfaces/desktop-app.js`** - Electron-based desktop application
- **`src/interfaces/preload.js`** - Secure Electron preload script
- **`src/interfaces/renderer.js`** - Desktop app frontend logic
- **`src/interfaces/renderer.html`** - Desktop app user interface

### 🚀 Distribution & CI/CD
- **Automated Builds** - GitHub Actions workflows for cross-platform compilation
- **Release Automation** - Automatic binary distribution for Windows, macOS, and Linux
- **Quality Assurance** - Automated testing and linting in CI pipeline

## Documentation

- [Product Requirements Document](tasks/prd-news-audio-converter.md)
- [Implementation Task List](tasks/tasks-prd-news-audio-converter.md) - **Complete ✅**
- [Development Rules and Guidelines](.github/copilot-instructions.md)
- [GitHub Actions Workflow](.github/workflows/build-release.yml) - Cross-platform build automation

## Development Approach

This project follows an agentic development approach with:
- 📋 Detailed PRDs and task breakdowns
- 🤖 AI-human collaborative implementation
- ✅ Test-driven development (165+ tests passing)
- 📊 Progress tracking and task management
- 🔄 Automated distribution pipeline

## CI/CD Pipeline

The project includes automated GitHub Actions workflows for:

- **Continuous Testing**: Runs on Node.js 18 & 20 with full test suite and linting
- **Cross-Platform Builds**: Generates binaries for Windows, macOS, and Linux
- **Automated Releases**: Creates GitHub releases with downloadable binaries on version tags
- **Artifact Management**: Stores build artifacts for easy access and deployment

**Triggering Releases:**
```bash
# Create and push a version tag to trigger release
git tag v1.0.0
git push origin v1.0.0
```

**Manual Workflow Trigger:**
- Use GitHub's "Actions" tab to manually trigger builds for testing

## Future Vision

The system is designed to evolve into a web application with browser plugin integration for URL-based article collection, while maintaining the core local processing engine.

---

*Part of the Tormenta ecosystem - Building tools for efficient information consumption*
