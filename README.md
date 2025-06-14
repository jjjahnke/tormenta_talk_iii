# TT3 - News Audio Converter

A cross-platform application that converts newspaper articles to audio files and imports them into iTunes playlists for hands-free listening.

## 📊 Current Status

**🔥 Active Development** - Core functionality 85% complete

### ✅ Completed Features
- **Local TTS Engine** - Cross-platform text-to-speech with chunking for stability (macOS, Windows, Linux)
- **iTunes Integration** - Automated playlist creation and audio import
- **File Processing** - Smart text extraction and preprocessing (.txt/.md support)
- **Audio Processing** - Temporary file management and audio format conversion coordination
- **Workflow Orchestration** - File discovery and batch processing with concurrency control
- **Testing Framework** - Comprehensive unit tests (124+ tests passing)

### 🔄 In Progress
- User interfaces (CLI and desktop app)
- Build system and distribution

### 📈 Progress Details
```bash
npm test        # Run all tests (124+ tests passing)
npm run lint    # Code quality checks
```

## Overview

TT3 (Tormenta Talk v3) automates the conversion of text articles to audio using local text-to-speech libraries, creating dated iTunes playlists for seamless iPhone synchronization. The system supports both command-line and desktop drag-and-drop interfaces.

## Key Features

- **Local TTS Processing:** Privacy-focused offline text-to-speech conversion with chunking for long documents
  - ✅ macOS (`say` command) - AIFF output with text chunking to prevent crashes
  - ✅ Windows (SAPI) - WAV output  
  - ✅ Linux (espeak) - WAV output
- **iTunes Integration:** Automatic playlist creation with "News-YYYY-MM-DD" naming
  - ✅ AppleScript automation for Music app
  - ✅ Playlist creation/cleanup (2-day retention)
  - ✅ Audio file import with metadata
- **File Processing:** Smart content extraction and preprocessing
  - ✅ Recursive directory scanning (.txt/.md files)
  - ✅ Markdown formatting cleanup
  - ✅ Text preprocessing for optimal TTS
  - ✅ Audio filename generation with timestamps
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
- **Smart Cleanup:** Automatically removes old playlists and audio files (2-day retention)
- **Progress Feedback:** Real-time processing status and error reporting

## Architecture

- **Modular Monolith:** Clear internal boundaries for future web service extraction
- **Local TTS:** No external API dependencies, complete offline operation
- **File-Based Processing:** Supports .txt and .md files with extensible content handling
- **Cross-Platform Desktop:** Built with Electron/Tauri for consistent experience

## Quick Start

```bash
# Install dependencies
npm install

# Run tests to verify setup
npm test

# Test integration workflow
node test-integration.js

# Development
npm run lint    # Check code quality
```

## Core Components

### 🎯 Implemented Modules
- **`src/core/tts-service.js`** - Cross-platform TTS engine with text preprocessing and chunking
- **`src/core/itunes-manager.js`** - Music app integration via AppleScript
- **`src/core/file-processor.js`** - Text file discovery and content extraction
- **`src/core/audio-converter.js`** - Audio processing coordination and temporary file management
- **`src/core/workflow-orchestrator.js`** - File discovery and batch processing pipeline

### 🔄 Coming Next
- **`src/interfaces/cli.js`** - Command-line interface
- **`src/interfaces/desktop-app.js`** - Desktop application

## Documentation

- [Product Requirements Document](tasks/prd-news-audio-converter.md)
- [Implementation Task List](tasks/tasks-prd-news-audio-converter.md) - **Updated with current progress**
- [Development Rules and Guidelines](.github/copilot-instructions.md)

## Development Approach

This project follows an agentic development approach with:
- 📋 Detailed PRDs and task breakdowns
- 🤖 AI-human collaborative implementation
- ✅ Test-driven development (124+ tests passing)
- 📊 Progress tracking and task management

## Future Vision

The system is designed to evolve into a web application with browser plugin integration for URL-based article collection, while maintaining the core local processing engine.

---

*Part of the Tormenta ecosystem - Building tools for efficient information consumption*
