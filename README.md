# TT3 - News Audio Converter

A cross-platform application that converts newspaper articles to audio files and imports them into iTunes playlists for hands-free listening.

## Overview

TT3 (Tormenta Talk v3) automates the conversion of text articles to audio using local text-to-speech libraries, creating dated iTunes playlists for seamless iPhone synchronization. The system supports both command-line and desktop drag-and-drop interfaces.

## Key Features

- **Local TTS Processing:** Privacy-focused offline text-to-speech conversion
- **iTunes Integration:** Automatic playlist creation with "News-YYYY-MM-DD" naming
- **Cross-Platform:** Works on macOS, Windows, and Linux
- **Dual Interface:** Command-line tool and desktop drag-and-drop application
- **Smart Cleanup:** Automatically removes old playlists and audio files (2-day retention)
- **Progress Feedback:** Real-time processing status and error reporting

## Architecture

- **Modular Monolith:** Clear internal boundaries for future web service extraction
- **Local TTS:** No external API dependencies, complete offline operation
- **File-Based Processing:** Supports .txt and .md files with extensible content handling
- **Cross-Platform Desktop:** Built with Electron/Tauri for consistent experience

## Project Status

🚧 **In Development** - Currently in planning and task breakdown phase

## Documentation

- [Product Requirements Document](tasks/prd-news-audio-converter.md)
- [Implementation Task List](tasks/tasks-prd-news-audio-converter.md)
- [Development Rules and Guidelines](.github/copilot-instructions.md)

## Future Vision

The system is designed to evolve into a web application with browser plugin integration for URL-based article collection, while maintaining the core local processing engine.

## Development Approach

This project follows an agentic development approach with detailed PRDs, task breakdowns, and AI-human collaborative implementation patterns.

---

*Part of the Tormenta ecosystem - Building tools for efficient information consumption*
