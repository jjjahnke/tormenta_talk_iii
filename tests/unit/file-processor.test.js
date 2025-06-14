const fs = require('fs').promises
const path = require('path')
const FileProcessor = require('../../src/core/file-processor')

describe('FileProcessor', () => {
  let fileProcessor
  let tempTestDir

  beforeEach(async () => {
    fileProcessor = new FileProcessor()
    // Create a temporary test directory
    tempTestDir = path.join(__dirname, '..', 'temp', 'test-files')
    await fs.mkdir(tempTestDir, { recursive: true })
  })

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(tempTestDir, { recursive: true })
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  describe('File Discovery and Processing', () => {
    test('should process directory with .txt and .md files', async () => {
      // Create test files
      await fs.writeFile(path.join(tempTestDir, 'article1.txt'), 'Test content 1')
      await fs.writeFile(path.join(tempTestDir, 'article2.txt'), 'Test content 2')
      await fs.writeFile(path.join(tempTestDir, 'readme.md'), 'Markdown content')
      await fs.writeFile(path.join(tempTestDir, 'image.jpg'), 'Not a text file')

      const result = await fileProcessor.processDirectory(tempTestDir)
      
      expect(result.files).toHaveLength(3) // 2 txt + 1 md
      expect(result.summary.totalFound).toBe(3)
      expect(result.summary.successfullyProcessed).toBe(3)
      expect(result.errors).toHaveLength(0)
      
      const filenames = result.files.map(f => f.filename)
      expect(filenames).toContain('article1.txt')
      expect(filenames).toContain('article2.txt')
      expect(filenames).toContain('readme.md')
    })

    test('should process files recursively in subdirectories', async () => {
      const subDir = path.join(tempTestDir, 'subfolder')
      await fs.mkdir(subDir, { recursive: true })
      await fs.writeFile(path.join(tempTestDir, 'root.txt'), 'Root content')
      await fs.writeFile(path.join(subDir, 'nested.txt'), 'Nested content')

      const result = await fileProcessor.processDirectory(tempTestDir)
      
      expect(result.files).toHaveLength(2)
      expect(result.summary.totalFound).toBe(2)
      const filenames = result.files.map(f => f.filename)
      expect(filenames).toContain('root.txt')
      expect(filenames).toContain('nested.txt')
    })

    test('should handle empty directory', async () => {
      const result = await fileProcessor.processDirectory(tempTestDir)
      expect(result.files).toHaveLength(0)
      expect(result.summary.totalFound).toBe(0)
    })

    test('should handle non-existent directory', async () => {
      const nonExistentDir = path.join(tempTestDir, 'does-not-exist')
      await expect(fileProcessor.processDirectory(nonExistentDir))
        .rejects.toThrow('Directory not found')
    })
  })

  describe('Single File Processing', () => {
    test('should process single text file', async () => {
      const testFile = path.join(tempTestDir, 'test.txt')
      const testContent = 'This is test content for TTS conversion.'
      await fs.writeFile(testFile, testContent)

      const result = await fileProcessor.processSingleFile(testFile)
      
      expect(result.rawContent).toBe(testContent)
      expect(result.cleanedText).toBe(testContent)
      expect(result.filename).toBe('test.txt')
      expect(result.extension).toBe('.txt')
      expect(result.success).toBe(true)
    })

    test('should process markdown file and clean formatting', async () => {
      const testFile = path.join(tempTestDir, 'test.md')
      const testContent = '# Header\n\nThis is **bold** and *italic* text.'
      await fs.writeFile(testFile, testContent)

      const result = await fileProcessor.processSingleFile(testFile)
      
      expect(result.rawContent).toBe(testContent)
      expect(result.cleanedText).not.toContain('#')
      expect(result.cleanedText).not.toContain('**')
      expect(result.cleanedText).not.toContain('*')
      expect(result.cleanedText).toContain('Header')
      expect(result.cleanedText).toContain('bold')
      expect(result.cleanedText).toContain('italic')
    })

    test('should handle empty file', async () => {
      const testFile = path.join(tempTestDir, 'empty.txt')
      await fs.writeFile(testFile, '')

      const result = await fileProcessor.processSingleFile(testFile)
      expect(result.rawContent).toBe('')
      expect(result.cleanedText).toBe('')
    })

    test('should handle non-existent file', async () => {
      const nonExistentFile = path.join(tempTestDir, 'does-not-exist.txt')
      await expect(fileProcessor.processSingleFile(nonExistentFile))
        .rejects.toThrow('File not found')
    })

    test('should handle file with UTF-8 encoding', async () => {
      const testFile = path.join(tempTestDir, 'utf8.txt')
      const testContent = 'Content with special characters: àáâãäåæçèéêë'
      await fs.writeFile(testFile, testContent, 'utf8')

      const result = await fileProcessor.processSingleFile(testFile)
      expect(result.rawContent).toBe(testContent)
      expect(result.cleanedText).toBe(testContent)
    })

    test('should reject unsupported file types', async () => {
      const testFile = path.join(tempTestDir, 'test.pdf')
      await fs.writeFile(testFile, 'PDF content')

      await expect(fileProcessor.processSingleFile(testFile))
        .rejects.toThrow('Unsupported file type')
    })
  })

  describe('Text Preprocessing', () => {
    test('should clean markdown formatting', () => {
      const processor = new FileProcessor()
      const markdownText = '# Header\n\n**Bold text** and *italic text*\n\n- List item 1\n- List item 2'
      const cleanedText = processor._preprocessText(markdownText)
      
      expect(cleanedText).not.toContain('#')
      expect(cleanedText).not.toContain('**')
      expect(cleanedText).not.toContain('*')
      expect(cleanedText).toContain('Header')
      expect(cleanedText).toContain('Bold text')
      expect(cleanedText).toContain('italic text')
    })

    test('should normalize quotation marks', () => {
      const processor = new FileProcessor()
      const textWithQuotes = 'He said "Hello" and "Goodbye" with "smart quotes".'
      const cleanedText = processor._preprocessText(textWithQuotes)
      
      expect(cleanedText).toContain('"Hello"')
      expect(cleanedText).toContain('"Goodbye"')
      expect(cleanedText).toContain('"smart quotes"')
    })

    test('should handle empty or whitespace-only text', () => {
      const processor = new FileProcessor()
      expect(processor._preprocessText('')).toBe('')
      expect(processor._preprocessText('   \n\n   ')).toBe('')
      expect(processor._preprocessText('\t\n')).toBe('')
    })

    test('should clean up whitespace and line breaks', () => {
      const processor = new FileProcessor()
      const textWithBreaks = 'First line.\n\n\nSecond line.\n\n\n\nThird line.'
      const cleanedText = processor._preprocessText(textWithBreaks)
      
      expect(cleanedText).toBe('First line. Second line. Third line.')
      expect(cleanedText).not.toContain('\n')
    })

    test('should ensure proper sentence endings', () => {
      const processor = new FileProcessor()
      const textWithoutEnding = 'This sentence has no ending'
      const cleanedText = processor._preprocessText(textWithoutEnding)
      
      expect(cleanedText).toBe('This sentence has no ending.')
      expect(cleanedText.endsWith('.')).toBe(true)
    })
  })

  describe('Audio Filename Generation', () => {
    test('should generate timestamped filename from file path', () => {
      const filePath = '/path/to/article-title.txt'
      const audioFilename = fileProcessor.generateAudioFilename(filePath)
      
      expect(audioFilename).toMatch(/^\d{4}-\d{2}-\d{2}-article-title\.aiff$/)
      expect(audioFilename).toMatch(/\.aiff$/)
    })

    test('should handle special characters in filename', () => {
      const filePath = '/path/to/article with spaces & symbols!.txt'
      const audioFilename = fileProcessor.generateAudioFilename(filePath)
      
      expect(audioFilename).toMatch(/^\d{4}-\d{2}-\d{2}-article-with-spaces-symbols\.aiff$/)
      expect(audioFilename).not.toContain(' ')
      expect(audioFilename).not.toContain('&')
      expect(audioFilename).not.toContain('!')
    })

    test('should handle different input extensions', () => {
      expect(fileProcessor.generateAudioFilename('/path/file.txt')).toMatch(/^\d{4}-\d{2}-\d{2}-file\.aiff$/)
      expect(fileProcessor.generateAudioFilename('/path/file.md')).toMatch(/^\d{4}-\d{2}-\d{2}-file\.aiff$/)
      expect(fileProcessor.generateAudioFilename('/path/file')).toMatch(/^\d{4}-\d{2}-\d{2}-file\.aiff$/)
    })

    test('should handle Windows-style paths', () => {
      const filePath = 'C:\\Users\\Documents\\news-article.txt'
      const audioFilename = fileProcessor.generateAudioFilename(filePath)
      
      expect(audioFilename).toMatch(/^\d{4}-\d{2}-\d{2}-news-article\.aiff$/)
    })

    test('should allow custom extension', () => {
      const filePath = '/path/to/article.txt'
      const audioFilename = fileProcessor.generateAudioFilename(filePath, '.mp3')
      
      expect(audioFilename).toMatch(/^\d{4}-\d{2}-\d{2}-article\.mp3$/)
    })
  })

  describe('File Processing Workflow', () => {
    test('should process directory and return comprehensive information', async () => {
      // Create test files with content
      const file1 = path.join(tempTestDir, 'article1.txt')
      const file2 = path.join(tempTestDir, 'article2.md')
      await fs.writeFile(file1, 'First article content with multiple sentences. This is good content.')
      await fs.writeFile(file2, '# Second Article\n\nThis is markdown content.')

      const result = await fileProcessor.processDirectory(tempTestDir)
      
      expect(result.files).toHaveLength(2)
      expect(result.summary.totalFound).toBe(2)
      expect(result.summary.successfullyProcessed).toBe(2)
      expect(result.summary.errors).toBe(0)
      
      const result1 = result.files.find(r => r.filename === 'article1.txt')
      const result2 = result.files.find(r => r.filename === 'article2.md')
      
      expect(result1).toBeDefined()
      expect(result1.cleanedText).toContain('First article content')
      expect(result1.extension).toBe('.txt')
      expect(result1.originalPath).toMatch(/article1\.txt$/)
      
      expect(result2).toBeDefined()
      expect(result2.cleanedText).toContain('Second Article')
      expect(result2.cleanedText).not.toContain('#')
      expect(result2.extension).toBe('.md')
    })

    test('should handle directory with no text files', async () => {
      // Create non-text files
      await fs.writeFile(path.join(tempTestDir, 'image.jpg'), 'binary data')
      await fs.writeFile(path.join(tempTestDir, 'data.json'), '{"key": "value"}')

      const result = await fileProcessor.processDirectory(tempTestDir)
      expect(result.files).toHaveLength(0)
      expect(result.summary.totalFound).toBe(0)
    })

    test('should provide file metadata', async () => {
      const testFile = path.join(tempTestDir, 'test-article.txt')
      const content = 'This is a test article. It has multiple sentences for testing purposes.'
      await fs.writeFile(testFile, content)

      const result = await fileProcessor.processDirectory(tempTestDir)
      const file = result.files[0]
      
      expect(file).toHaveProperty('originalPath')
      expect(file).toHaveProperty('filename')
      expect(file).toHaveProperty('dirname')
      expect(file).toHaveProperty('extension')
      expect(file).toHaveProperty('size')
      expect(file).toHaveProperty('modified')
      expect(file).toHaveProperty('created')
      expect(file).toHaveProperty('rawContent')
      expect(file).toHaveProperty('cleanedText')
      expect(file).toHaveProperty('success')
      
      expect(file.size).toBeGreaterThan(0)
      expect(file.success).toBe(true)
    })
  })

  describe('Content Validation', () => {
    test('should validate content quality', async () => {
      const testFile = path.join(tempTestDir, 'good-content.txt')
      const content = 'This is good content with sufficient length for TTS processing.'
      await fs.writeFile(testFile, content)

      const processed = await fileProcessor.processSingleFile(testFile)
      const validation = fileProcessor.validateContent(processed)
      
      expect(validation.isValid).toBe(true)
      expect(validation.issues).toHaveLength(0)
    })

    test('should identify content issues', async () => {
      const testFile = path.join(tempTestDir, 'short-content.txt')
      await fs.writeFile(testFile, 'Short')

      const processed = await fileProcessor.processSingleFile(testFile)
      const validation = fileProcessor.validateContent(processed)
      
      expect(validation.isValid).toBe(false)
      expect(validation.issues).toContain('Text content is too short (less than 10 characters)')
    })

    test('should handle empty content', () => {
      const emptyFile = {
        cleanedText: ''
      }
      const validation = fileProcessor.validateContent(emptyFile)
      
      expect(validation.isValid).toBe(false)
      expect(validation.issues).toContain('No readable text content found')
    })
  })

  describe('Error Handling', () => {
    test('should handle inaccessible directory gracefully', async () => {
      const restrictedPath = '/root/restricted-folder'
      await expect(fileProcessor.processDirectory(restrictedPath))
        .rejects.toThrow()
    })

    test('should handle file processing errors', async () => {
      // Create a file that will cause issues
      const testFile = path.join(tempTestDir, 'test.txt')
      await fs.writeFile(testFile, 'normal content')
      
      // Create a very large file that exceeds limits
      const largeContent = 'x'.repeat(2 * 1024 * 1024) // 2MB, exceeds 1MB default limit
      const largeFile = path.join(tempTestDir, 'large.txt')
      await fs.writeFile(largeFile, largeContent)

      await expect(fileProcessor.processSingleFile(largeFile))
        .rejects.toThrow('File too large')
    })
  })

  describe('Statistics and Management', () => {
    test('should provide processing statistics', () => {
      const stats = fileProcessor.getStats()
      
      expect(stats).toHaveProperty('supportedExtensions')
      expect(stats).toHaveProperty('maxFileSize')
      expect(stats.supportedExtensions).toContain('.txt')
      expect(stats.supportedExtensions).toContain('.md')
      expect(stats.maxFileSize).toBe(1024 * 1024)
    })

    test('should allow resetting processor state', () => {
      fileProcessor.errors = ['test error']
      fileProcessor.processed = ['test processed']
      
      fileProcessor.reset()
      
      expect(fileProcessor.errors).toHaveLength(0)
      expect(fileProcessor.processed).toHaveLength(0)
    })
  })

  describe('Performance', () => {
    test('should handle multiple files efficiently', async () => {
      // Create multiple test files
      const numFiles = 10
      for (let i = 0; i < numFiles; i++) {
        await fs.writeFile(
          path.join(tempTestDir, `article${i}.txt`),
          `This is article ${i} with test content for processing.`
        )
      }

      const startTime = Date.now()
      const result = await fileProcessor.processDirectory(tempTestDir)
      const duration = Date.now() - startTime
      
      expect(result.files).toHaveLength(numFiles)
      expect(result.summary.successfullyProcessed).toBe(numFiles)
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
    })
  })
})
