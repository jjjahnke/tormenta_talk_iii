# Product Requirements Document: News Audio Converter

## 1. Introduction/Overview

The News Audio Converter is a modular application system that converts newspaper articles into audio files for hands-free news consumption. The system supports optional iTunes playlist integration and provides flexible output options. The system is designed with a phased approach: starting with local file processing (command-line and desktop drag-and-drop) and evolving toward a web-based application with URL collection and browser plugin integration.

**Primary Goal:** Enable daily hands-free consumption of newspaper articles through automated text-to-speech conversion, with flexible output options including direct file placement and optional iTunes playlist management, using a flexible architecture that supports both current local file workflows and future web-based article collection.

**Context:** This system serves as both a standalone local application and the foundation for a future web application where users will collect article URLs via browser plugins and generate audio files on-demand.

**Architecture Vision:** The core processing engine (text-to-speech, iTunes integration, file management) will be designed as reusable components that can serve both local desktop applications and web-based backends. The system uses local TTS libraries for offline operation, privacy protection, and elimination of external service dependencies.

## 2. Goals & Success Metrics

### Primary Goals
1. **Automate Daily News Audio Generation:** Convert articles to audio files with a single action (command, drag-and-drop, or web button)
2. **Flexible Output Options:** Support direct audio file placement alongside source files by default, with optional iTunes playlist integration
3. **Intelligent File Management:** Automatically handle filename conflicts and provide efficient storage options
4. **Intuitive User Interface:** Provide multiple interaction methods (CLI, desktop, and future web interface)
5. **Modular Architecture:** Design core components for reuse in both local and web-based implementations

### Success Metrics
- **Conversion Success Rate:** 99%+ of text files successfully converted to audio
- **File Placement Accuracy:** 100% reliable audio file placement in correct locations with proper naming
- **iTunes Integration Success (when enabled):** 100% reliable iTunes playlist creation and iPhone sync
- **Storage Efficiency:** Configurable retention policies and efficient file conflict resolution
- **Processing Speed:** Complete workflow (conversion + file placement/iTunes integration + cleanup) under 5 minutes for typical daily volume

### Timeline/Priority
- **Priority:** High - Daily use case requires reliable, consistent operation
- **Target Completion:** 2-3 weeks for full implementation

### Benefits of Local TTS Architecture
- **Privacy:** Article content never leaves the local system
- **Offline Operation:** No internet connection required for processing
- **Cost Efficiency:** No external service fees or API rate limits
- **Reliability:** No dependency on external service availability
- **Performance:** Faster processing without network latency
- **Simplicity:** Easier deployment and configuration

### Performance Requirements
- **Processing Speed:** Handle typical daily volume (10-50 articles) within 5 minutes
- **Memory Usage:** Minimal memory footprint for background processing
- **CPU Usage:** Reasonable CPU utilization that doesn't interfere with other tasks
- **Temporary Storage Management:** Efficient temporary file creation and cleanup without excessive disk usage
- **Cross-Platform Performance:** Consistent performance across development (Apple Silicon) and deployment (AMD64) architectures

### Integration Requirements
- **iTunes Library:** Must reliably create and manage playlists without corrupting library
- **File System:** Safe file operations with proper error handling and temporary directory management
- **Cross-Platform Integration:** Consistent behavior across macOS, Windows, and Linux environments
- **Desktop Environment:** Seamless integration with platform-specific file managers and drag-and-drop patterns
- **GitHub Integration:** Automated release packaging and distribution via GitHub Actions
- **Modular Monolith Design:** Clear internal module boundaries with dependency injection for future service extraction
- **Priority:** High - Daily use case requires reliable, consistent operation
- **Target Completion:** 2-3 weeks for full implementation

## 3. Target Users

### Primary User (Current Phase)
- **Role:** News consumer who prefers audio content
- **Context:** Individual with existing article collection workflow seeking hands-free consumption
- **Technical Level:** Comfortable with command-line tools OR prefers simple drag-and-drop interface
- **Usage Pattern:** Daily execution, typically morning routine before commuting or exercising

### Future User (Web Application Phase)
- **Role:** News consumer who browses articles online
- **Context:** Individual who discovers articles throughout the day and wants to batch-convert for later listening
- **Technical Level:** Basic web user comfortable with browser plugins and web applications
- **Usage Pattern:** Ongoing article collection via browser plugin, periodic audio generation via web interface

### User Scenarios
- Morning preparation while getting ready for work
- Commuting via public transportation or walking
- Exercise routines (running, gym workouts)
- Household chores or cooking
- Any activity requiring hands-free information consumption

## 4. User Stories

### Current Phase Stories
- **As a news consumer**, I want to run a single command that converts my saved articles to audio files placed alongside the source files, so that I can easily find and listen to them hands-free
- **As a non-technical user**, I want to drag a folder of articles onto a desktop icon to start the conversion process, so that I don't need to remember command-line syntax
- **As an iPhone user**, I want the option to automatically organize articles in a dated iTunes playlist, so that I can easily sync and play today's news content on my device
- **As someone who prefers simple file management**, I want audio files saved directly next to my text files by default, so that my content stays organized without additional complexity
- **As a user with existing files**, I want the system to automatically handle naming conflicts by creating numbered versions, so that my existing audio files are never overwritten accidentally

### Future Phase Stories (Web Application)
- **As a web user**, I want to collect article URLs while browsing using a browser plugin, so that I can build a reading list throughout the day
- **As a busy professional**, I want to click a single button on a web interface to convert all my collected articles to audio, so that I can listen during commute without manual file management
- **As a mobile user**, I want the web app to automatically sync new audio content to my iTunes/iPhone, so that I have seamless access across devices
- **As a content curator**, I want to organize articles by topic or source before conversion, so that I can create themed audio playlists

### Current Secondary Stories
- **As a daily user**, I want the system to handle various text file formats, so that articles from different sources work consistently
- **As a multitasker**, I want clear audio quality with appropriate pacing, so that I can understand the content while doing other activities
- **As an iTunes user**, I want the option to enable playlist integration, so that content can automatically sync to my iPhone when desired
- **As a user who prefers manual file management**, I want audio files placed directly with source files by default, so that I maintain full control over my content organization
- **As a desktop user**, I want visual feedback when dragging folders to the application icon, so that I know the process has started
- **As a user monitoring progress**, I want to see which specific file is being converted, so that I can track processing status
- **As a user encountering errors**, I want failed conversions presented in a dismissible dialog, so that I can quickly review and dismiss issues
- **As a daily user**, I want a simple manual process without automation complexity, so that I maintain control over when processing occurs

## 5. Functional Requirements

### Phase 1: Core Processing Engine (Current Implementation)

#### Text Processing & Audio Conversion
1. **The system must provide a modular text-to-speech conversion service using local TTS library for offline operation and privacy**
2. **The system must generate audio files in iPhone-compatible format (MP3 or AAC) by default**
3. **The system must handle common text file formats (.txt, .md) and be extensible for web-extracted content**
4. **The system must generate meaningful audio filenames based on source content (filename or article title)**
5. **The system must provide clear success/failure feedback for each operation with structured logging**
6. **The system must attempt to convert all articles and report which files failed with specific error messages**

#### Default File Output Behavior
7. **The system must by default save audio files in the same directory as the source text file**
8. **The system must use the same base filename as the source file but with appropriate audio extension (.mp3 or .aac)**
9. **The system must handle filename conflicts by appending sequential numbers (e.g., filename-1.mp3, filename-2.mp3, etc.)**
10. **The system must check for existing files with the target name and automatically increment the suffix until a unique name is found**
11. **The system must provide an option to overwrite existing files instead of creating numbered versions**

#### Optional iTunes Integration & Storage Management
12. **The system must provide optional iTunes integration that can be enabled via command-line flag or UI option**
13. **When iTunes integration is enabled, the system must copy audio files to iTunes library and create playlists with naming convention "News-YYYY-MM-DD"**
14. **When iTunes integration is enabled, the system must add all successfully converted audio files to the current day's playlist**
15. **When iTunes integration is enabled, the system must automatically delete audio files older than specified days from iTunes library (default: 2 days)**
16. **When iTunes integration is enabled, the system must automatically delete iTunes playlists older than specified days (default: 2 days)**
17. **The system must complete all operations (convert, file placement, optional iTunes integration, cleanup) in a single execution with comprehensive error handling**

#### Web Application Audio Processing (Future)
13. **For web application deployment, the system must support combining individual audio files into a single large audio file**
14. **The system must maintain article boundaries and metadata within combined audio files for navigation**

### Phase 1: User Interfaces

#### Command-Line Interface
18. **The system must provide a command-line interface that accepts a directory path as input**
19. **The system must support optional parameters for verbose logging and configuration**
20. **The system must provide a command-line flag (--itunes or --playlist) to enable iTunes integration**
21. **The system must provide a command-line flag (--overwrite) to overwrite existing audio files instead of creating numbered versions**
22. **The system must provide help documentation showing all available options and usage examples**

#### Desktop Application Interface
23. **The system must provide a cross-platform desktop application with "TT3" branding for Tormenta Talk v3**
24. **The system must accept folder drag-and-drop onto the application icon to initiate processing**
25. **The system must provide visual feedback during drag-and-drop operations (hover states, drop zones)**
26. **The system must display file-by-file progress during TTS conversion phase with current file being processed**
27. **The system must display file-by-file progress during file placement and optional iTunes upload phases**
28. **The system must provide a UI toggle/checkbox to enable iTunes integration before processing**
29. **The system must show overall completion status via desktop notification**
30. **The system must present any conversion or upload failures in a dismissible dialog at completion**
31. **The system must handle multiple file types being dragged simultaneously**
32. **The system must package as a single executable with automated GitHub Release zip distribution**

### Phase 2: Web Application Foundation (Design Requirements)

#### Modular Architecture Requirements
33. **The system must be designed as a modular monolith with clear internal module boundaries**
34. **The core text-to-speech engine must be accessible via internal APIs for future web integration**
35. **The iTunes integration service must be designed as a separate optional module that can be called remotely**
36. **The system must maintain a clear separation between content acquisition, processing, and output management**
37. **The system must support article metadata storage (URL, title, source, collection date) as file-based metadata**
38. **Web-based article processing must download content, extract article text, and save as local files for processing by existing workflows**

#### Web Application Audio Processing (Future)
39. **For web application deployment, the system must support combining individual audio files into a single large audio file**
40. **The system must maintain article boundaries and metadata within combined audio files for navigation**
41. **Web applications must support both file download and optional iTunes integration based on user preferences**

#### Future Web Interface Requirements (Out of Current Scope)
- URL collection and management system
- Browser plugin integration  
- Web-based user interface for article review and organization
- User authentication and article list management
- API endpoints for plugin communication
- Linux AMD64 deployment architecture

## 6. Non-Goals (Out of Scope)

### Current Phase Exclusions
- **Article Collection from Web:** System does not fetch or save articles from web sources in Phase 1 (existing workflow handles this)
- **Audio Editing:** No advanced audio processing, effects, or editing capabilities
- **Multiple Voice Options:** Single third-party TTS voice sufficient for initial implementation
- **Native Platform Applications:** Focus on cross-platform solution rather than platform-specific implementations
- **Advanced GUI Features:** No complex settings interface, preferences, or advanced configuration options
- **Custom Audio Settings:** Standard quality settings sufficient
- **Article Text Processing:** No summarization, formatting, or content modification beyond basic cleanup
- **Streaming Integration:** No Spotify, Apple Music, or other streaming service integration
- **Cloud Storage:** Local files only, no cloud sync or backup
- **Batch Folder Management:** No support for processing multiple folders simultaneously
- **Manual Installation Processes:** No complex installers, focus on simple zip distribution

### Future Phase Exclusions (Not in Current Scope)
- **Web Application Development:** Browser plugin creation, web interface, user authentication
- **Content Management System:** Article organization, tagging, searching, or curation features
- **Social Features:** Sharing, collaborative playlists, or social media integration
- **Advanced Web Scraping:** Handling complex website structures, paywalls, or dynamic content
- **Multi-User Support:** User accounts, permissions, or shared content management

## 7. Assumptions

### Current Phase Assumptions
- **iTunes Installation (Optional):** For users who enable iTunes integration, iTunes is installed and properly configured (initially macOS, cross-platform iTunes compatibility to be evaluated)
- **iPhone Sync (Optional):** For users using iTunes integration, iPhone is set up to sync with iTunes playlists
- **File Access:** System has read/write access to article directory and can create audio files in the same locations
- **Text File Quality:** Source text files contain readable content (not corrupted or heavily formatted)
- **Daily Usage Pattern:** User runs the process manually once per day, typically in the morning
- **Storage Availability:** Sufficient local storage for audio files alongside source text files
- **Cross-Platform Compatibility:** Third-party TTS solution provides consistent quality across platforms
- **GitHub Access:** Users can access GitHub Releases for application downloads and updates
- **Manual Operation Preference:** Users prefer manual control over automated scheduling for daily news processing
- **Error Tolerance:** Users can handle occasional conversion failures and prefer simple error reporting over complex recovery mechanisms
- **File Organization:** Users prefer audio files to be placed alongside source files by default for simple organization

### Architecture Assumptions for Future Development
- **Modular Monolith Scalability:** Internal module boundaries will facilitate future service extraction
- **File-Based Processing Consistency:** Web-extracted articles can be processed using the same file-based workflows
- **Content Format Consistency:** Web-scraped article content will be processable by the same TTS engine after text extraction
- **User Migration Path:** Users will transition from local file workflows to web-based URL collection gradually
- **Infrastructure Scalability:** Web application will run on Linux AMD64 architecture with same core processing components
- **Article Extraction Quality:** Web scraping and text extraction will produce content suitable for TTS processing

## 8. Design Considerations

### Command-Line Interface
- Single command execution with clear progress indicators
- Optional parameters for iTunes integration (--itunes or --playlist flag)
- Optional parameters for file overwrite behavior (--overwrite flag)
- Verbose logging option for troubleshooting
- Clear help documentation showing all available options
- Error messages that clearly indicate failure points and suggested fixes

### Desktop Application Interface
- Simple, minimal desktop icon design featuring "TT3" graphical representation for Tormenta Talk v3
- Visual feedback during drag operations (highlighting, animation, or visual cues)
- File-by-file progress indication during TTS conversion and optional iTunes upload phases
- Clear iTunes integration toggle/checkbox for user control
- Desktop notifications for overall completion status
- Error handling with dismissible dialog showing specific conversion failures at completion
- Consistent cross-platform design patterns and conventions

### Audio Quality
- Default voice quality suitable for extended listening
- Standard bitrate balancing file size and audio clarity
- Consistent volume levels across all generated files

### File Organization
- Clear naming conventions for generated audio files matching source file names
- Audio files placed directly alongside source text files by default
- Intelligent filename conflict resolution with numbered suffixes
- Optional iTunes integration with organized temporary storage and playlist management
- Predictable behavior for user confidence in file locations

## 9. Technical Considerations

### Core Technologies
- **Text-to-Speech:** ✅ **IMPLEMENTED** - Local TTS library with chunking strategy for cross-platform operation
  - macOS: `say` command with AIFF output and intelligent text chunking to prevent crashes
  - Windows: SAPI with WAV output 
  - Linux: espeak with WAV output
  - Configurable chunk processing (default: 500 words, sentence-boundary splitting)
  - Multiple audio concatenation methods (ffmpeg primary, binary AIFF concatenation fallback)
  - Timeout protection and error recovery for reliable long-document processing
- **iTunes Integration:** ✅ **IMPLEMENTED** - Optional AppleScript automation for playlist creation and audio import
- **File Processing:** ✅ **IMPLEMENTED** - Cross-platform file operations with direct file placement and intelligent conflict resolution
- **Desktop Application:** Cross-platform framework (Electron or Tauri) for consistent deployment across platforms
- **Drag-and-Drop:** Cross-platform drag-and-drop APIs for folder acceptance
- **Modular Monolith Architecture:** Single deployable unit with clear internal module boundaries
- **Data Storage:** File-based article storage for both local files and web-extracted content
- **Distribution:** GitHub Releases with automated zip packaging for easy installation

### Performance Requirements
- **Processing Speed:** Handle typical daily volume (10-50 articles) within 5 minutes
- **Memory Usage:** Minimal memory footprint for background processing
- **CPU Usage:** Reasonable CPU utilization that doesn't interfere with other tasks

### Integration Requirements
- **iTunes Library (Optional):** When enabled, must reliably create and manage playlists without corrupting library
- **File System:** Safe file operations with proper error handling and intelligent filename conflict resolution
- **Cross-Platform Integration:** Consistent behavior across macOS, Windows, and Linux environments
- **Desktop Environment:** Seamless integration with platform-specific file managers and drag-and-drop patterns
- **API Readiness:** Internal interfaces designed for future web service exposure
- **Service Modularity:** Clear separation between content processing, optional iTunes management, and user interface layers

### Security Considerations
- **File Access:** Only access specified directories and iTunes library
- **Data Privacy:** No external transmission of article content
- **System Impact:** Minimal system modification beyond iTunes playlist management

### TTS Stability and Long Document Processing ✅ **IMPLEMENTED**
- **Chunking Strategy:** Text splitting at sentence boundaries to prevent TTS engine crashes on long articles
- **Configurable Processing:** Adjustable chunk sizes (default: 500 words) based on system capabilities
- **Audio Concatenation:** Multiple concatenation methods (ffmpeg primary, binary fallback) for seamless output
- **Timeout Protection:** Individual chunk processing with configurable timeouts (default: 30 seconds)
- **Error Recovery:** Graceful handling of chunk processing failures with detailed error reporting
- **Cross-Platform Optimization:** Platform-specific optimizations for macOS `say`, Windows SAPI, and Linux espeak
- **Quality Preservation:** Sentence-boundary chunking maintains natural speech flow in final audio output

## 10. Risk Assessment

### High Risk Items
- **Local TTS Library Integration:** ✅ **MITIGATED** - Cross-platform TTS library integration completed with chunking strategy
  - *Solution Implemented:* LocalTTSService with platform-specific engines (macOS say, Windows SAPI, Linux espeak), intelligent text chunking at sentence boundaries, configurable chunk sizes, timeout protection, and multiple audio concatenation methods
- **Cross-Platform iTunes Integration (Optional):** iTunes behavior may vary significantly across platforms when integration is enabled
  - *Mitigation:* Implement platform-specific iTunes integration strategies with comprehensive testing, make iTunes integration optional
- **File Format Variations:** Different article sources may have incompatible text formats
  - *Mitigation:* Robust text parsing with fallback to basic processing, design preprocessing pipeline for web content
- **Filename Conflict Management:** Multiple conversions of the same file could create numerous numbered versions
  - *Mitigation:* Implement intelligent conflict resolution with user option to overwrite existing files
- **Temporary File Management:** Improper cleanup could leave large temporary files on user systems (when iTunes integration is enabled)
  - *Mitigation:* Implement robust cleanup mechanisms with fail-safes and user notifications

### Medium Risk Items
- **GitHub Release Distribution:** Users may have difficulty with zip installation or updates
  - *Mitigation:* Provide clear installation documentation and consider future auto-update mechanisms
- **Audio Quality Consistency:** Local TTS library may handle some text poorly (URLs, formatting artifacts) or have limited voice options
  - *Mitigation:* Implement text preprocessing pipeline to remove common artifacts, research best local TTS options
- **Cross-Platform Development Complexity:** Electron/Tauri apps may have platform-specific issues
  - *Mitigation:* Establish comprehensive testing across all target platforms early in development
- **Modular Monolith Evolution:** Internal module boundaries may need refactoring for future service extraction
  - *Mitigation:* Design with clear interfaces and dependency injection from the start

### Low Risk Items
- **Daily Usage Workflow:** User may forget to run command
  - *Mitigation:* Clear documentation for automation options (cron, etc.)

## 11. Open Questions

### Technical Implementation (Resolved)
- **TTS Engine Choice:** ✅ **RESOLVED** - Use local TTS library for offline operation, privacy, and reliability (research cross-platform Node.js options)
- **Audio File Storage:** ✅ **RESOLVED** - Store in temporary directory, copy to iTunes, then cleanup temporary files
- **Error Recovery:** ✅ **RESOLVED** - System should convert everything it can and report specific failures with detailed error messages
- **Desktop App Framework:** ✅ **RESOLVED** - Use cross-platform solution (Electron or Tauri) for consistent deployment
- **Application Distribution:** ✅ **RESOLVED** - GitHub Releases with automated zip packaging for easy installation
- **Service Architecture:** ✅ **RESOLVED** - Modular monolith design with clear internal module boundaries
- **Data Model:** ✅ **RESOLVED** - File-based storage for articles; web processing will extract and save articles as files
- **Progress Feedback:** ✅ **RESOLVED** - File-by-file processing display for both TTS conversion and iTunes upload phases
- **Automation Options:** ✅ **RESOLVED** - No automation required, process remains manual for daily use
- **Desktop Icon Design:** ✅ **RESOLVED** - "TT3" graphical representation for Tormenta Talk v3
- **Error Handling:** ✅ **RESOLVED** - Show conversion failures in dismissible dialog at completion
- **Transition Planning:** ✅ **RESOLVED** - No migration concerns needed due to daily activity pattern

### Local TTS Implementation Planning
- **TTS Library Selection:** Which local TTS library provides the best balance of quality, cross-platform support, and ease of integration? (say.js, espeak, festival, platform-specific options)
- **Voice Quality Assessment:** What voice quality standards are acceptable for extended listening during commutes?
- **Cross-Platform Audio:** How will audio format consistency be maintained across different platforms and TTS engines?
- **TTS Performance:** What are the expected processing speeds for typical article lengths with local TTS libraries?
- **Language Support:** Should the system support multiple languages or focus on English-only content?
- **Voice Customization:** Should users be able to select from multiple voices or adjust speech rate/pitch?

### Future Web Application Planning
- **Browser Plugin Architecture:** What browser plugin framework will provide the best URL collection experience?
- **Web Technology Stack:** Should the future web app use similar technology stack (Node.js/Electron alignment)?
- **iTunes Integration for Web:** How will web users manage iTunes playlist creation remotely?
- **Content Acquisition:** What web scraping framework will be used for extracting article content from URLs?
- **Article Text Extraction:** What libraries/services will handle extraction of clean article text from various website formats?
- **Linux Deployment:** What container strategy will be used for Linux AMD64 deployment?
- **Audio File Combination:** What approach will be used to combine individual articles into single audio files for web users?

### Future Enhancements
- **Voice Customization:** Priority for adding multiple TTS voice options in future versions?
- **Advanced Desktop Features:** Settings panels, preferences, or configuration options for future releases?
- **Web Application Timeline:** When should development of the web application phase begin?
- **Auto-Update Mechanism:** Should future versions include automatic update capabilities?

---

*This PRD provides the foundation for implementing a reliable, daily-use news audio conversion system with flexible output options. By default, the system places audio files alongside source text files for simple organization, with optional iTunes integration for users who want playlist management and iPhone sync. The modular architecture uses local TTS libraries for privacy, offline operation, and reliability, ensuring that the core processing components can evolve from local desktop applications to web-based services while maintaining data privacy and operational independence.*

## Appendix: Web Application Evolution Path

### Phase 1: Local Application (Current Scope)
- Command-line and cross-platform desktop drag-and-drop interfaces
- Local file processing with modular monolith architecture and clear internal boundaries
- Local TTS library integration with offline operation and privacy protection
- iTunes integration and playlist management
- GitHub Releases distribution with automated zip packaging
- Comprehensive error handling with detailed failure reporting

### Phase 2: Web Application (Future Development)
- Browser plugin for URL collection and article saving
- Web interface for article review, organization, and audio generation  
- Article content extraction and file-based storage for processing consistency
- Remote iTunes integration via local service communication or combined audio file generation
- User account management and article list persistence
- Linux AMD64 deployment with containerization
- Migration tools for transitioning from local file workflows

### Phase 3: Enhanced Web Features (Long-term Vision)
- Advanced article organization and tagging
- Multiple TTS voice and quality options
- Social features and playlist sharing
- Integration with additional podcast platforms and services
- Auto-update mechanisms and advanced user management
