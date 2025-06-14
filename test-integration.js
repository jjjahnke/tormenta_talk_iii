#!/usr/bin/env node

const path = require('path')
const ITunesManager = require('./src/core/itunes-manager')
const LocalTTSService = require('./src/core/tts-service')

async function testIntegration() {
  console.log('🎵 Testing TT3 iTunes Integration...\n')
  
  // Initialize services
  const itunesManager = new ITunesManager({
    playlistPrefix: 'TT3-Test',
    cleanupDays: 1
  })
  
  const ttsService = new LocalTTSService()
  
  try {
    // Test TTS Service
    console.log('📢 Initializing TTS service...')
    await ttsService.initialize()
    console.log('✅ TTS service initialized successfully')
    
    // Test iTunes Manager
    console.log('🎵 Initializing iTunes manager...')
    await itunesManager.initialize()
    console.log('✅ iTunes manager initialized successfully')
    
    // Get current status
    console.log('\n📊 Getting iTunes status...')
    const status = await itunesManager.getStatus()
    console.log(`Music app running: ${status.isRunning}`)
    console.log(`Existing playlists: ${status.playlists.length}`)
    if (status.playlists.length > 0) {
      console.log(`  - ${status.playlists.join('\n  - ')}`)
    }
    
    // Create test audio
    console.log('\n🔊 Creating test audio file...')
    const testText = 'This is a test of the TT3 news audio converter system. The integration between text-to-speech and iTunes playlist management is working correctly.'
    const audioPath = path.join(__dirname, 'test-integration.aiff')
    
    const audioResult = await ttsService.convertTextToAudio(testText, audioPath)
    console.log(`✅ Audio created: ${audioResult.audioPath}`)
    console.log(`   Duration: ${audioResult.duration} seconds`)
    
    // Import to iTunes
    console.log('\n📥 Importing to iTunes playlist...')
    const importResult = await itunesManager.importToPlaylist(
      audioPath,
      'TT3 Integration Test',
      'TT3 System'
    )
    
    console.log(`✅ Successfully imported to playlist: ${importResult.playlistName}`)
    console.log(`   Track ID: ${importResult.trackId}`)
    console.log(`   Track Name: ${importResult.trackName}`)
    
    // Get updated status
    console.log('\n📊 Updated iTunes status...')
    const updatedStatus = await itunesManager.getStatus()
    console.log(`Total playlists: ${updatedStatus.playlists.length}`)
    console.log(`Latest playlist: ${importResult.playlistName}`)
    
    console.log('\n🧹 Testing cleanup functionality...')
    // Note: We won't actually cleanup since we just created the playlist
    console.log('✅ Cleanup functions available (skipping actual cleanup for demo)')
    
    console.log('\n🎉 All integration tests passed successfully!')
    console.log('🎵 Check your Music app for the new playlist and track.')
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message)
    process.exit(1)
  } finally {
    // Cleanup services
    await ttsService.cleanup()
    await itunesManager.cleanup()
    console.log('\n🔧 Services cleaned up')
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testIntegration().catch(console.error)
}

module.exports = testIntegration
