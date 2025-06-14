# Product Requirements Document: News Audio Converter

## 1. Introduction/Overview

The News Audio Converter is a modular application system that converts newspaper articles into audio files and imports them into iTunes playlists for hands-free news consumption. The system is designed with a phased approach: starting with local file processing (command-line and desktop drag-and-drop) and evolving toward a web-based application with URL collection and browser plugin integration.

**Primary Goal:** Enable daily hands-free consumption of newspaper articles through automated text-to-speech conversion and iTunes playlist management, with a flexible architecture that supports both current local file workflows and future web-based article collection.

**Context:** This system serves as both a standalone local application and the foundation for a future web application where users will collect article URLs via browser plugins and generate audio files on-demand.

**Architecture Vision:** The core processing engine (text-to-speech, iTunes integration, file management) will be designed as reusable components that can serve both local desktop applications and web-based backends. The system uses local TTS libraries for offline operation, privacy protection, and elimination of external service dependencies.

## 2. Goals & Success Metrics

### Primary Goals
1. **Automate Daily News Audio Generation:** Convert articles to audio files with a single action (command, drag-and-drop, or web button)
2. **Seamless iTunes Integration:** Create dated playlists that automatically sync to iPhone for immediate listening
3. **Efficient Storage Management:** Maintain only current and previous day's content to prevent storage bloat
4. **Intuitive User Interface:** Provide multiple interaction methods (CLI, desktop, and future web interface)
5. **Modular Architecture:** Design core components for reuse in both local and web-based implementations

### Success Metrics
- **Conversion Success Rate:** 99%+ of text files successfully converted to audio
- **Playlist Creation Success:** 100% reliable iTunes playlist creation and iPhone sync
- **Storage Efficiency:** Maximum 2 days of audio content retained at any time
- **Processing Speed:** Complete workflow (conversion + playlist creation + cleanup) under 5 minutes for typical daily volume

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
- **As a news consumer**, I want to run a single command that converts my saved articles to audio, so that I can listen to them hands-free during my commute
- **As a non-technical user**, I want to drag a folder of articles onto a desktop icon to start the conversion process, so that I don't need to remember command-line syntax
- **As an iPhone user**, I want articles automatically organized in a dated iTunes playlist, so that I can easily find and play today's news content
- **As someone with limited storage**, I want old audio files and playlists automatically cleaned up, so that my device doesn't accumulate unnecessary files

### Future Phase Stories (Web Application)
- **As a web user**, I want to collect article URLs while browsing using a browser plugin, so that I can build a reading list throughout the day
- **As a busy professional**, I want to click a single button on a web interface to convert all my collected articles to audio, so that I can listen during commute without manual file management
- **As a mobile user**, I want the web app to automatically sync new audio content to my iTunes/iPhone, so that I have seamless access across devices
- **As a content curator**, I want to organize articles by topic or source before conversion, so that I can create themed audio playlists

### Current Secondary Stories
- **As a daily user**, I want the system to handle various text file formats, so that articles from different sources work consistently
- **As a multitasker**, I want clear audio quality with appropriate pacing, so that I can understand the content while doing other activities
- **As a mobile user**, I want the playlist to sync reliably to my iPhone, so that content is available offline
- **As a desktop user**, I want visual feedback when dragging folders to the application icon, so that I know the process has started
- **As a user monitoring progress**, I want to see which specific file is being converted and uploaded, so that I can track processing status
- **As a user encountering errors**, I want failed conversions presented in a dismissible dialog, so that I can quickly review and dismiss issues
- **As a daily user**, I want a simple manual process without automation complexity, so that I maintain control over when processing occurs

## 5. Functional Requirements

### Phase 1: Core Processing Engine (Current Implementation)

#### Text Processing & Audio Conversion
1. **The system must provide a modular text-to-speech conversion service using local TTS library for offline operation and privacy**
2. **The system must generate audio files in iPhone-compatible format (MP3 or AAC) in a temporary directory**
3. **The system must handle common text file formats (.txt, .md) and be extensible for web-extracted content**
4. **The system must generate meaningful audio filenames based on source content (filename or article title)**
5. **The system must provide clear success/failure feedback for each operation with structured logging**
6. **The system must attempt to convert all articles and report which files failed with specific error messages**
7. **The system must clean up temporary audio files after successful iTunes import or processing completion**

#### iTunes Integration & Storage Management
8. **The system must copy audio files from temporary directory to iTunes library and create playlists with naming convention "News-YYYY-MM-DD"**
9. **The system must add all successfully converted audio files to the current day's playlist**
10. **The system must automatically delete audio files older than 2 days from iTunes library**
11. **The system must automatically delete iTunes playlists older than 2 days**
12. **The system must complete all operations (convert, import, cleanup) in a single execution with comprehensive error handling**

#### Web Application Audio Processing (Future)
13. **For web application deployment, the system must support combining individual audio files into a single large audio file**
14. **The system must maintain article boundaries and metadata within combined audio files for navigation**

### Phase 1: User Interfaces

#### Command-Line Interface
11. **The system must provide a command-line interface that accepts a directory path as input**
12. **The system must support optional parameters for verbose logging and configuration**

#### Desktop Application Interface
15. **The system must provide a cross-platform desktop application with "TT3" branding for Tormenta Talk v3**
16. **The system must accept folder drag-and-drop onto the application icon to initiate processing**
17. **The system must provide visual feedback during drag-and-drop operations (hover states, drop zones)**
18. **The system must display file-by-file progress during TTS conversion phase with current file being processed**
19. **The system must display file-by-file progress during iTunes upload phase with current file being uploaded**
20. **The system must show overall completion status via desktop notification**
21. **The system must present any conversion or upload failures in a dismissible dialog at completion**
22. **The system must handle multiple file types being dragged simultaneously**
23. **The system must package as a single executable with automated GitHub Release zip distribution**

### Phase 2: Web Application Foundation (Design Requirements)

#### Modular Architecture Requirements
22. **The system must be designed as a modular monolith with clear internal module boundaries**
23. **The core text-to-speech engine must be accessible via internal APIs for future web integration**
24. **The iTunes integration service must be designed as a separate module that can be called remotely**
25. **The system must maintain a clear separation between content acquisition, processing, and output management**
26. **The system must support article metadata storage (URL, title, source, collection date) as file-based metadata**
27. **Web-based article processing must download content, extract article text, and save as local files for processing by existing workflows**

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
- **iTunes Installation:** User has iTunes installed and properly configured (initially macOS, cross-platform iTunes compatibility to be evaluated)
- **iPhone Sync:** User's iPhone is set up to sync with iTunes playlists
- **File Access:** System has read/write access to article directory, temporary directories, and iTunes library
- **Text File Quality:** Source text files contain readable content (not corrupted or heavily formatted)
- **Daily Usage Pattern:** User runs the process manually once per day, typically in the morning
- **Storage Availability:** Sufficient local storage for temporary files and 2 days of audio content
- **Cross-Platform Compatibility:** Third-party TTS solution provides consistent quality across platforms
- **GitHub Access:** Users can access GitHub Releases for application downloads and updates
- **Manual Operation Preference:** Users prefer manual control over automated scheduling for daily news processing
- **Error Tolerance:** Users can handle occasional conversion failures and prefer simple error reporting over complex recovery mechanisms

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
- Optional parameters for source directory and output settings
- Verbose logging option for troubleshooting
- Error messages that clearly indicate failure points and suggested fixes

### Desktop Application Interface
- Simple, minimal desktop icon design featuring "TT3" graphical representation for Tormenta Talk v3
- Visual feedback during drag operations (highlighting, animation, or visual cues)
- File-by-file progress indication during both TTS conversion and iTunes upload phases
- Desktop notifications for overall completion status
- Error handling with dismissible dialog showing specific conversion failures at completion
- Consistent cross-platform design patterns and conventions

### Audio Quality
- Default voice quality suitable for extended listening
- Standard bitrate balancing file size and audio clarity
- Consistent volume levels across all generated files

### File Organization
- Clear naming conventions for generated audio files
- Organized temporary storage before iTunes import
- Predictable cleanup behavior for user confidence

## 9. Technical Considerations

### Core Technologies
- **Text-to-Speech:** Local TTS library (cross-platform Node.js solution like say.js, node-speaker, or similar) for offline operation and privacy
- **iTunes Integration:** AppleScript or iTunes Library XML manipulation (modularized for remote access)
- **File Processing:** Temporary directory management with cleanup, cross-platform file operations
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
- **iTunes Library:** Must reliably create and manage playlists without corrupting library
- **File System:** Safe file operations with proper error handling
- **macOS Integration:** Follow macOS conventions for temporary files, system integration, and desktop application behavior
- **Desktop Environment:** Seamless integration with macOS Finder and desktop drag-and-drop patterns
- **API Readiness:** Internal interfaces designed for future web service exposure
- **Service Modularity:** Clear separation between content processing, iTunes management, and user interface layers

### Security Considerations
- **File Access:** Only access specified directories and iTunes library
- **Data Privacy:** No external transmission of article content
- **System Impact:** Minimal system modification beyond iTunes playlist management

## 10. Risk Assessment

### High Risk Items
- **Local TTS Library Integration:** Cross-platform TTS library may have varying quality or platform compatibility issues
  - *Mitigation:* Research and test multiple local TTS options (say.js, espeak, festival), implement library abstraction layer with fallbacks
- **Cross-Platform iTunes Integration:** iTunes behavior may vary significantly across platforms
  - *Mitigation:* Implement platform-specific iTunes integration strategies with comprehensive testing
- **File Format Variations:** Different article sources may have incompatible text formats
  - *Mitigation:* Robust text parsing with fallback to basic processing, design preprocessing pipeline for web content
- **Temporary File Management:** Improper cleanup could leave large temporary files on user systems
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

*This PRD provides the foundation for implementing a reliable, daily-use news audio conversion system that integrates seamlessly with existing article collection workflows and iTunes/iPhone ecosystem. The modular architecture uses local TTS libraries for privacy, offline operation, and reliability, ensuring that the core processing components can evolve from local desktop applications to web-based services while maintaining data privacy and operational independence.*

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
