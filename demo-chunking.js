#!/usr/bin/env node

const LocalTTSService = require('./src/core/tts-service')
const path = require('path')
const fs = require('fs-extra')

async function demonstrateChunking() {
  console.log('🎙️  TTS Chunking Strategy Demonstration\n')
  
  const ttsService = new LocalTTSService({
    enableChunking: true,
    maxChunkWords: 50, // Small chunks for demo
    maxProcessTimeout: 10000
  })

  try {
    await ttsService.initialize()
    console.log('✅ TTS Service initialized successfully')
    console.log(`Platform: ${ttsService.platform}`)
    console.log(`Engine: ${ttsService._getTTSEngine()}\n`)

    // Create a long text that will require chunking
    const longText = `
      This is a demonstration of the TTS chunking strategy implemented in TT3.
      The system intelligently breaks down long articles into manageable chunks.
      Each chunk is processed separately to prevent the say command from crashing.
      The chunks are then concatenated back together to create the final audio file.
      This approach ensures reliable processing of very long newspaper articles.
      The chunking happens at sentence boundaries to maintain natural flow.
      Users can configure the maximum words per chunk based on their system capabilities.
      The system supports both ffmpeg concatenation and binary fallback methods.
      Error handling includes timeout protection for each individual chunk.
      This robust implementation allows processing of articles of any length safely.
    `.trim()

    console.log(`📝 Sample text length: ${longText.split(/\s+/).length} words\n`)

    // Test chunking logic without actual TTS
    const chunks = ttsService._chunkText(longText, 50)
    console.log(`🔪 Text chunked into ${chunks.length} pieces:\n`)
    
    chunks.forEach((chunk, index) => {
      const wordCount = chunk.split(/\s+/).length
      console.log(`Chunk ${index + 1}: ${wordCount} words`)
      console.log(`"${chunk.substring(0, 80)}..."\n`)
    })

    if (process.platform === 'darwin') {
      console.log('🎵 Generating audio with chunking strategy...')
      const outputPath = path.join(__dirname, 'chunking-demo.aiff')
      
      const result = await ttsService.convertTextToAudio(longText, outputPath, {
        enableChunking: true,
        maxChunkWords: 50
      })
      
      console.log('✅ Audio generation complete!')
      console.log(`Method: ${result.method}`)
      console.log(`Chunks processed: ${result.chunks}`)
      console.log(`Output file: ${outputPath}`)
      console.log(`Duration: ${result.duration} seconds`)
      
      // Verify file exists and has content
      if (await fs.pathExists(outputPath)) {
        const stats = await fs.stat(outputPath)
        console.log(`File size: ${Math.round(stats.size / 1024)}KB`)
        
        // Clean up demo file
        await fs.unlink(outputPath)
        console.log('🧹 Demo file cleaned up')
      }
    } else {
      console.log('ℹ️  Audio generation skipped (not on macOS)')
      console.log('   Chunking logic verified above')
    }

  } catch (error) {
    console.error('❌ Error during demonstration:', error.message)
  } finally {
    await ttsService.cleanup()
    console.log('\n🏁 Demonstration complete!')
  }
}

// Run if called directly
if (require.main === module) {
  demonstrateChunking().catch(console.error)
}

module.exports = { demonstrateChunking }
