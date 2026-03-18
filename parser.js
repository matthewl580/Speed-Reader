import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.269/pdf.min.mjs';

// Initialize Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.269/pdf.worker.min.mjs';

/**
 * The main parsing function exported to your app
 */
export async function parsePDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let structuredDoc = {
        fileName: file.name,
        chapters: [] 
    };

    let currentChapterIdx = -1;

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // If no text items, it's a scanned image - use OCR
        if (textContent.items.length === 0) {
            const ocrText = await performOCR(page);
            currentChapterIdx = appendToDoc(structuredDoc, ocrText, i, currentChapterIdx, true);
        } else {
            // Process native text
            textContent.items.forEach(item => {
                const fontSize = item.transform[0];
                const text = item.str.trim();
                if (!text) return;

                // Simple Header Detection: Large font or "Chapter" keywords
                const isTitle = fontSize > 16 || /^(chapter|section|article|part)\s+\d+/i.test(text);
                
                if (isTitle) {
                    structuredDoc.chapters.push({ title: text, content: "", page: i });
                    currentChapterIdx++;
                } else {
                    currentChapterIdx = appendToDoc(structuredDoc, text, i, currentChapterIdx, false);
                }
            });
        }
    }
    return structuredDoc;
}

async function performOCR(page) {
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: ctx, viewport }).promise;
    
    // Tesseract is global from the CDN script tag in HTML
    const result = await Tesseract.recognize(canvas, 'eng');
    return result.data.text;
}

function appendToDoc(doc, text, pageNum, idx, isOCR) {
    let activeIdx = idx;
    // If we haven't found a chapter title yet, create a default one
    if (activeIdx === -1) {
        const title = isOCR ? `Scanned Page ${pageNum}` : "Introduction";
        doc.chapters.push({ title: title, content: text, page: pageNum });
        activeIdx = 0;
    } else {
        doc.chapters[activeIdx].content += " " + text;
    }
    return activeIdx;
}