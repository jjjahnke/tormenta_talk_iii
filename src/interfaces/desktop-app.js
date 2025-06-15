/**
 * TT3 - News Audio Converter Desktop Application
 *
 * Cross-platform desktop application with drag-and-drop interface
 * Built with Electron and the complete WorkflowOrchestrator
 */

const { app, BrowserWindow, ipcMain, dialog, Notification, Menu } = require('electron')
const path = require('path')
const fs = require('fs-extra')

// Safely detect if running in development mode
let isDev = false
try {
  isDev = require('electron-is-dev')
} catch (error) {
  // Not in Electron environment, assume production
  isDev = false
}

// Import our core processing engine
const WorkflowOrchestrator = require('../core/workflow-orchestrator')

class TT3DesktopApp {
  constructor () {
    this.mainWindow = null
    this.orchestrator = null
    this.processingStatus = {
      isProcessing: false,
      currentFile: null,
      progress: { processed: 0, total: 0 },
      errors: []
    }

    // Default settings
    this.settings = {
      enableItunesIntegration: false,
      overwriteExisting: false
    }

    this.loadSettings()
    this.setupElectronHandlers()
    this.setupIPCHandlers()
  }

  setupElectronHandlers () {
    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow()
      this.setupApplicationMenu()

      // macOS specific: re-create window when dock icon is clicked
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow()
        }
      })
    })

    // Handle all windows closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    // Handle app before quit
    app.on('before-quit', async () => {
      if (this.orchestrator && this.processingStatus.isProcessing) {
        await this.orchestrator.stop()
      }
    })
  }

  createMainWindow () {
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      minWidth: 600,
      minHeight: 400,
      titleBarStyle: 'default',
      icon: this.getAppIcon(),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      },
      show: false // Don't show until ready-to-show
    })

    // Load the renderer HTML
    this.mainWindow.loadFile(path.join(__dirname, 'renderer.html'))

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show()

      if (isDev) {
        this.mainWindow.webContents.openDevTools()
      }
    })

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  getAppIcon () {
    // Platform-specific icon paths
    const iconName = process.platform === 'darwin'
      ? 'icon.icns'
      : process.platform === 'win32' ? 'icon.ico' : 'icon.png'

    const iconPath = path.join(__dirname, '../../assets', iconName)

    // Return icon path if it exists, otherwise undefined (use default)
    return fs.existsSync(iconPath) ? iconPath : undefined
  }

  setupApplicationMenu () {
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Select Folder...',
            accelerator: 'CmdOrCtrl+O',
            click: () => this.handleSelectFolder()
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => app.quit()
          }
        ]
      },
      {
        label: 'Process',
        submenu: [
          {
            label: 'Start Processing',
            accelerator: 'CmdOrCtrl+R',
            click: () => this.sendToRenderer('menu-start-processing')
          },
          {
            label: 'Stop Processing',
            accelerator: 'CmdOrCtrl+S',
            click: () => this.sendToRenderer('menu-stop-processing')
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About TT3',
            click: () => this.showAboutDialog()
          }
        ]
      }
    ]

    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
      template.unshift({
        label: app.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      })
    }

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }

  setupIPCHandlers () {
    // Handle folder selection
    ipcMain.handle('select-folder', async () => {
      return await this.handleSelectFolder()
    })

    // Handle file/folder processing
    ipcMain.handle('process-path', async (event, inputPath) => {
      return await this.handleProcessPath(inputPath)
    })

    // Handle stopping processing
    ipcMain.handle('stop-processing', async () => {
      return await this.handleStopProcessing()
    })

    // Handle getting processing status
    ipcMain.handle('get-status', () => {
      return this.processingStatus
    })

    // Handle opening external links
    ipcMain.handle('open-external', async (event, url) => {
      const { shell } = require('electron')
      await shell.openExternal(url)
    })

    // Handle settings management
    ipcMain.handle('get-settings', () => {
      return this.getSettings()
    })

    ipcMain.handle('save-settings', async (event, settings) => {
      return await this.saveSettings(settings)
    })
  }

  async handleSelectFolder () {
    const result = await dialog.showOpenDialog(this.mainWindow, {
      properties: ['openDirectory'],
      title: 'Select folder containing news articles',
      buttonLabel: 'Select Folder'
    })

    if (!result.canceled && result.filePaths.length > 0) {
      const selectedPath = result.filePaths[0]
      this.sendToRenderer('folder-selected', selectedPath)
      return selectedPath
    }

    return null
  }

  async handleProcessPath (inputPath) {
    if (this.processingStatus.isProcessing) {
      throw new Error('Processing is already in progress')
    }

    try {
      // Validate input path
      const pathExists = await fs.pathExists(inputPath)
      if (!pathExists) {
        throw new Error(`Path does not exist: ${inputPath}`)
      }

      // Initialize orchestrator if needed
      if (!this.orchestrator) {
        this.orchestrator = new WorkflowOrchestrator({
          enableProgress: true,
          continueOnError: true,
          detailedErrors: true,
          enableItunesIntegration: this.settings.enableItunesIntegration,
          overwriteExisting: this.settings.overwriteExisting,
          outputMode: 'direct'
        })

        this.setupOrchestratorEvents()
      }

      // Reset processing status
      this.processingStatus = {
        isProcessing: true,
        currentFile: null,
        progress: { processed: 0, total: 0 },
        errors: []
      }

      // Start processing
      const result = await this.orchestrator.processPath(inputPath)

      // Update final status
      this.processingStatus.isProcessing = false

      // Show completion notification
      this.showNotification(
        'Processing Complete',
        `Successfully processed ${result.successful}/${result.total} files`
      )

      return result
    } catch (error) {
      this.processingStatus.isProcessing = false
      this.sendToRenderer('processing-error', error.message)

      this.showNotification(
        'Processing Failed',
        error.message,
        'error'
      )

      throw error
    }
  }

  async handleStopProcessing () {
    if (this.orchestrator && this.processingStatus.isProcessing) {
      await this.orchestrator.stop()
      this.processingStatus.isProcessing = false

      this.sendToRenderer('processing-stopped')

      this.showNotification(
        'Processing Stopped',
        'Processing has been stopped by user'
      )
    }
  }

  setupOrchestratorEvents () {
    this.orchestrator.on('workflow-started', (data) => {
      this.processingStatus.progress.total = data.totalFiles
      this.sendToRenderer('workflow-started', data)
    })

    this.orchestrator.on('file-started', (data) => {
      this.processingStatus.currentFile = data.fileName
      this.sendToRenderer('file-started', data)
    })

    this.orchestrator.on('file-step', (data) => {
      this.sendToRenderer('file-step', data)
    })

    this.orchestrator.on('file-completed', (data) => {
      this.processingStatus.progress.processed++
      this.sendToRenderer('file-completed', data)
    })

    this.orchestrator.on('file-failed', (data) => {
      this.processingStatus.errors.push({
        fileName: data.fileName,
        error: data.error
      })
      this.sendToRenderer('file-failed', data)
    })

    this.orchestrator.on('workflow-completed', (data) => {
      this.processingStatus.isProcessing = false
      this.sendToRenderer('workflow-completed', data)
    })

    this.orchestrator.on('workflow-error', (data) => {
      this.processingStatus.isProcessing = false
      this.sendToRenderer('workflow-error', data)
    })
  }

  sendToRenderer (channel, data = null) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data)
    }
  }

  showNotification (title, body, type = 'info') {
    if (Notification.isSupported()) {
      new Notification({
        title,
        body,
        icon: this.getAppIcon()
      }).show()
    }
  }

  // Settings management methods
  loadSettings () {
    try {
      const { app } = require('electron')
      const settingsPath = path.join(app.getPath('userData'), 'tt3-settings.json')

      if (fs.existsSync(settingsPath)) {
        const savedSettings = fs.readJsonSync(settingsPath)
        this.settings = { ...this.settings, ...savedSettings }
      }
    } catch (error) {
      console.warn('Failed to load settings:', error.message)
      // Use default settings if loading fails
    }
  }

  async saveSettings (newSettings) {
    try {
      const { app } = require('electron')
      const settingsPath = path.join(app.getPath('userData'), 'tt3-settings.json')

      this.settings = { ...this.settings, ...newSettings }
      await fs.writeJson(settingsPath, this.settings, { spaces: 2 })

      return { success: true }
    } catch (error) {
      console.error('Failed to save settings:', error.message)
      return { success: false, error: error.message }
    }
  }

  getSettings () {
    return this.settings
  }

  showAboutDialog () {
    const packageJson = require('../../package.json')

    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'About TT3',
      message: 'TT3 - News Audio Converter',
      detail: `Version: ${packageJson.version}\n\nA cross-platform application for converting news articles to audio and importing them to iTunes.\n\nFeatures:\n• Local text-to-speech processing\n• Automatic iTunes playlist creation\n• Drag-and-drop interface\n• Batch file processing\n\nBuilt with privacy in mind - all processing happens locally.`,
      buttons: ['OK']
    })
  }
}

// Initialize and start the application only in Electron environment
if (typeof app !== 'undefined' && app.whenReady && typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  const appInstance = new TT3DesktopApp()
  console.log('TT3 Desktop App initialized', appInstance.constructor.name)
}

module.exports = TT3DesktopApp
