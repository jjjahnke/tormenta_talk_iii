/**
 * Test Desktop Application Components
 *
 * Simple test to validate desktop app without GUI
 */

const path = require('path')
const TT3DesktopApp = require('./desktop-app')

console.log('Testing TT3 Desktop App Components...')

// Test the class definition
if (typeof TT3DesktopApp === 'function') {
  console.log('✅ TT3DesktopApp class is properly defined')
} else {
  console.log('❌ TT3DesktopApp class is not properly defined')
  process.exit(1)
}

// Test method existence
const prototype = TT3DesktopApp.prototype
const expectedMethods = [
  'setupElectronHandlers',
  'createMainWindow',
  'getAppIcon',
  'setupApplicationMenu',
  'setupIPCHandlers',
  'handleSelectFolder',
  'handleProcessPath',
  'handleStopProcessing',
  'setupOrchestratorEvents',
  'sendToRenderer',
  'showNotification',
  'showAboutDialog'
]

let methodsOk = true
expectedMethods.forEach(method => {
  if (typeof prototype[method] === 'function') {
    console.log(`✅ Method ${method} exists`)
  } else {
    console.log(`❌ Method ${method} missing`)
    methodsOk = false
  }
})

if (methodsOk) {
  console.log('✅ All required methods are present')
} else {
  console.log('❌ Some methods are missing')
  process.exit(1)
}

// Test file paths
const rendererPath = path.join(__dirname, 'renderer.html')
const preloadPath = path.join(__dirname, 'preload.js')

const fs = require('fs')

if (fs.existsSync(rendererPath)) {
  console.log('✅ renderer.html exists')
} else {
  console.log('❌ renderer.html missing')
}

if (fs.existsSync(preloadPath)) {
  console.log('✅ preload.js exists')
} else {
  console.log('❌ preload.js missing')
}

console.log('✅ Desktop app component validation complete!')
console.log('\nNext: Test with `npm run dev:desktop` to open the GUI')
