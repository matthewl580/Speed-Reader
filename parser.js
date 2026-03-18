// FIXED PDF Parser - Better Chapter Detection + Display Names

(function() {
  console.log('PDF Parser loading...');
  
  window.parsePDF = async (file, onProgress = null) => {
    if (typeof pdfjsLib === 'undefined') throw new Error('pdf.js missing');
    
    try {
      if (!file || file.type !== 'application/pdf') throw new Error('Invalid PDF');
      if (file.size > 50 * 1024 * 1024) throw new Error('PDF too large');

      onProgress?.('Reading file...');
      const arrayBuffer = await file.arrayBuffer();
      
      onProgress?.('Loading PDF...');
      const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
      
      const chapters = [];
      let pageContent = '';
      let currentTitle = 'Document';
      
      onProgress?.(`Parsing ${pdf.numPages} pages...`);

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        onProgress?.(`Page ${pageNum}/${pdf.numPages}`);
        
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str.trim()).join(' ').trim();
        
        pageContent += ' ' + pageText;
        
        // Chapter detection - look for common patterns
        const chapterMatch = pageText.match(/(Chapter|CHAPTER|chapter)\s+(\w+|[\d Roman]+)/i) ||
                           pageText.match(/(Section|SECTION|section)\s+(\w+|[\d Roman]+)/i) ||
                           pageText.match(/^([IVXLC]+\.?\s+[\w\s]+|Part\s+\w+)/i) ||
                           pageText.match(/^\d+\.\s+[\w\s]+/);
        
        if (chapterMatch) {
          // Save previous chapter
          if (pageContent.trim().length > 100) {
            chapters.push({
              title: currentTitle,
              content: pageContent.trim()
            });
          }
          
          // New chapter
          currentTitle = chapterMatch[0];
          pageContent = pageText;
          
          console.log(`Found chapter: ${currentTitle}`);
        }
      }
      
      // Final chapter
      if (pageContent.trim().length > 100) {
        chapters.push({
          title: currentTitle,
          content: pageContent.trim()
        });
      }
      
      // Fallback if no chapters found
      if (chapters.length === 0) {
        chapters.push({
          title: 'Document',
          content: pageContent.trim()
        });
      }

      onProgress?.(`Success! ${chapters.length} chapters parsed`);
      
      return {
        fileName: file.name,
        chapters
      };
      
    } catch (error) {
      console.error('PDF parse failed:', error);
      throw new Error(error.message || 'Parse failed');
    }
  };
  
  console.log('PDF Parser ready');
})();

