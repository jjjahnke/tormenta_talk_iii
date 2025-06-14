const { spawn } = require('child_process')
const fs = require('fs-extra')

/**
 * iTunes Manager - iTunes integration and playlist management
 * Handles audio file import and playlist creation using AppleScript
 */
class ITunesManager {
  constructor (options = {}) {
    this.options = {
      playlistPrefix: options.playlistPrefix || 'News',
      cleanupDays: options.cleanupDays || 2,
      importTimeout: options.importTimeout || 30000,
      ...options
    }
    this.platform = process.platform
    this.initialized = false
  }

  /**
   * Initialize iTunes integration and verify availability
   */
  async initialize () {
    try {
      await this._checkiTunesAvailability()
      this.initialized = true
      return { success: true, platform: this.platform }
    } catch (error) {
      throw new Error(`Failed to initialize iTunes integration: ${error.message}`)
    }
  }

  /**
   * Import audio file to iTunes and add to daily playlist
   * @param {string} audioFilePath - Path to the audio file
   * @param {string} title - Title for the track
   * @param {string} artist - Artist name (optional)
   * @returns {Promise<{success: boolean, playlistName: string, trackId?: string}>}
   */
  async importToPlaylist (audioFilePath, title, artist = 'TT3 News') {
    if (!this.initialized) {
      throw new Error('iTunes Manager not initialized. Call initialize() first.')
    }

    if (!await fs.pathExists(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`)
    }

    try {
      const playlistName = this._generatePlaylistName()

      // Create playlist if it doesn't exist
      await this._createPlaylistIfNeeded(playlistName)

      // Import the audio file
      const importResult = await this._importAudioFile(audioFilePath, title, artist)

      // Add to playlist
      await this._addToPlaylist(importResult.trackId, playlistName)

      return {
        success: true,
        playlistName,
        trackId: importResult.trackId,
        trackName: title
      }
    } catch (error) {
      throw new Error(`Failed to import to iTunes: ${error.message}`)
    }
  }

  /**
   * Clean up old playlists and remove associated files
   * @returns {Promise<{success: boolean, cleanedPlaylists: string[], removedTracks: number}>}
   */
  async cleanupOldContent () {
    if (!this.initialized) {
      throw new Error('iTunes Manager not initialized. Call initialize() first.')
    }

    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - this.options.cleanupDays)

      const cleanedPlaylists = []
      const removedTracksCount = await this._removeOldPlaylists(cutoffDate, cleanedPlaylists)

      return {
        success: true,
        cleanedPlaylists,
        removedTracks: removedTracksCount
      }
    } catch (error) {
      throw new Error(`Failed to cleanup old content: ${error.message}`)
    }
  }

  /**
   * Get iTunes status and available playlists
   */
  async getStatus () {
    if (!this.initialized) {
      throw new Error('iTunes Manager not initialized. Call initialize() first.')
    }

    try {
      const isRunning = await this._isiTunesRunning()
      const playlists = await this._getNewsPlaylists()

      return {
        isRunning,
        playlists,
        platform: this.platform
      }
    } catch (error) {
      throw new Error(`Failed to get iTunes status: ${error.message}`)
    }
  }

  /**
   * Check if iTunes is available on the system
   */
  async _checkiTunesAvailability () {
    if (this.platform !== 'darwin') {
      throw new Error('iTunes integration only supported on macOS')
    }

    return new Promise((resolve, reject) => {
      // Check if Music application exists (modern macOS)
      const checkScript = `
        tell application "Finder"
          return exists application file id "com.apple.Music"
        end tell
      `

      const osascript = spawn('osascript', ['-e', checkScript])
      let output = ''

      osascript.stdout.on('data', (data) => {
        output += data.toString()
      })

      osascript.on('close', (code) => {
        if (code === 0 && output.trim() === 'true') {
          resolve(true)
        } else {
          reject(new Error('iTunes/Music app not available'))
        }
      })

      osascript.on('error', (error) => {
        reject(new Error(`AppleScript execution failed: ${error.message}`))
      })
    })
  }

  /**
   * Check if iTunes/Music is currently running
   */
  async _isiTunesRunning () {
    return new Promise((resolve, reject) => {
      const checkScript = `
        tell application "System Events"
          return (exists application process "iTunes") or (exists application process "Music")
        end tell
      `

      const osascript = spawn('osascript', ['-e', checkScript])
      let output = ''

      osascript.stdout.on('data', (data) => {
        output += data.toString()
      })

      osascript.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim() === 'true')
        } else {
          reject(new Error('Failed to check iTunes status'))
        }
      })

      osascript.on('error', (error) => {
        reject(new Error(`AppleScript execution failed: ${error.message}`))
      })
    })
  }

  /**
   * Generate playlist name based on current date
   */
  _generatePlaylistName () {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${this.options.playlistPrefix}-${year}-${month}-${day}`
  }

  /**
   * Create playlist if it doesn't already exist
   */
  async _createPlaylistIfNeeded (playlistName) {
    return new Promise((resolve, reject) => {
      const createScript = `
        tell application "Music"
          if not (exists playlist "${playlistName}") then
            make new playlist with properties {name:"${playlistName}"}
          end if
        end tell
      `

      const osascript = spawn('osascript', ['-e', createScript])

      osascript.on('close', (code) => {
        if (code === 0) {
          resolve(true)
        } else {
          reject(new Error(`Failed to create playlist: ${playlistName}`))
        }
      })

      osascript.on('error', (error) => {
        reject(new Error(`AppleScript execution failed: ${error.message}`))
      })
    })
  }

  /**
   * Import audio file to iTunes library
   */
  async _importAudioFile (audioFilePath, title, artist) {
    return new Promise((resolve, reject) => {
      const importScript = `
        tell application "Music"
          set theFile to POSIX file "${audioFilePath}"
          set theTrack to add theFile
          set theTrack's name to "${title}"
          set theTrack's artist to "${artist}"
          return id of theTrack
        end tell
      `

      const osascript = spawn('osascript', ['-e', importScript])
      let output = ''

      osascript.stdout.on('data', (data) => {
        output += data.toString()
      })

      osascript.on('close', (code) => {
        if (code === 0) {
          resolve({
            trackId: output.trim(),
            success: true
          })
        } else {
          reject(new Error(`Failed to import audio file: ${audioFilePath}`))
        }
      })

      osascript.on('error', (error) => {
        reject(new Error(`AppleScript execution failed: ${error.message}`))
      })
    })
  }

  /**
   * Add track to specific playlist
   */
  async _addToPlaylist (trackId, playlistName) {
    return new Promise((resolve, reject) => {
      const addScript = `
        tell application "Music"
          set theTrack to track id ${trackId}
          duplicate theTrack to playlist "${playlistName}"
        end tell
      `

      const osascript = spawn('osascript', ['-e', addScript])

      osascript.on('close', (code) => {
        if (code === 0) {
          resolve(true)
        } else {
          reject(new Error(`Failed to add track to playlist: ${playlistName}`))
        }
      })

      osascript.on('error', (error) => {
        reject(new Error(`AppleScript execution failed: ${error.message}`))
      })
    })
  }

  /**
   * Get all news-related playlists
   */
  async _getNewsPlaylists () {
    return new Promise((resolve, reject) => {
      const listScript = `
        tell application "Music"
          set playlistNames to {}
          repeat with p in playlists
            if name of p starts with "${this.options.playlistPrefix}-" then
              set end of playlistNames to name of p
            end if
          end repeat
          return playlistNames
        end tell
      `

      const osascript = spawn('osascript', ['-e', listScript])
      let output = ''

      osascript.stdout.on('data', (data) => {
        output += data.toString()
      })

      osascript.on('close', (code) => {
        if (code === 0) {
          // Parse AppleScript list output
          const playlists = output.trim().split(', ').filter(name => name.length > 0)
          resolve(playlists)
        } else {
          reject(new Error('Failed to get playlist list'))
        }
      })

      osascript.on('error', (error) => {
        reject(new Error(`AppleScript execution failed: ${error.message}`))
      })
    })
  }

  /**
   * Remove old playlists and their tracks
   */
  async _removeOldPlaylists (cutoffDate, cleanedPlaylists) {
    try {
      const playlists = await this._getNewsPlaylists()
      let removedTracksCount = 0

      for (const playlistName of playlists) {
        const playlistDate = this._parsePlaylistDate(playlistName)
        if (playlistDate && playlistDate < cutoffDate) {
          const tracksRemoved = await this._removePlaylist(playlistName)
          cleanedPlaylists.push(playlistName)
          removedTracksCount += tracksRemoved
        }
      }

      return removedTracksCount
    } catch (error) {
      throw new Error(`Failed to remove old playlists: ${error.message}`)
    }
  }

  /**
   * Parse date from playlist name
   */
  _parsePlaylistDate (playlistName) {
    const datePattern = new RegExp(`${this.options.playlistPrefix}-(\\d{4})-(\\d{2})-(\\d{2})`)
    const match = playlistName.match(datePattern)

    if (match) {
      const [, year, month, day] = match
      const yearNum = parseInt(year)
      const monthNum = parseInt(month)
      const dayNum = parseInt(day)

      // Validate ranges
      if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
        return null
      }

      const date = new Date(yearNum, monthNum - 1, dayNum)

      // Check if the date is valid (JavaScript Date constructor is lenient)
      if (date.getFullYear() !== yearNum ||
          date.getMonth() !== monthNum - 1 ||
          date.getDate() !== dayNum) {
        return null
      }

      return date
    }

    return null
  }

  /**
   * Remove specific playlist and its tracks
   */
  async _removePlaylist (playlistName) {
    return new Promise((resolve, reject) => {
      const removeScript = `
        tell application "Music"
          set trackCount to 0
          if exists playlist "${playlistName}" then
            set trackCount to count of tracks of playlist "${playlistName}"
            delete playlist "${playlistName}"
          end if
          return trackCount
        end tell
      `

      const osascript = spawn('osascript', ['-e', removeScript])
      let output = ''

      osascript.stdout.on('data', (data) => {
        output += data.toString()
      })

      osascript.on('close', (code) => {
        if (code === 0) {
          resolve(parseInt(output.trim()) || 0)
        } else {
          reject(new Error(`Failed to remove playlist: ${playlistName}`))
        }
      })

      osascript.on('error', (error) => {
        reject(new Error(`AppleScript execution failed: ${error.message}`))
      })
    })
  }

  /**
   * Cleanup and shutdown
   */
  async cleanup () {
    // No persistent connections to clean up for AppleScript
    this.initialized = false
    return { success: true }
  }
}

module.exports = ITunesManager
