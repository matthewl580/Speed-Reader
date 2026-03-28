// FIXED PDF Parser - Quote-aware chapter parsing + Enhanced Quotes

(function () {
  console.log("PDF Parser loading...");

  // ENHANCED: Quote-aware parser - fancy quotes, code, markdown, single quotes
  function parseContentWithQuotes(content) {
    const words = [];
    let isInQuotes = false;

    // ALL quote types: ", ', `, « », “ ”, ‘ ’
    const quoteTypes = /["'`"''""«»"'‘’""]/;
    const openQuotes = /["'``«'‘""]/;
    const closeQuotes = /["''»'""']/;

    const parts = content.split(/(\s+)/); // Split on whitespace only

    for (let i = 0; i < parts.length; i++) {
      let part = parts[i].trim();
      if (!part) continue;

      // Check for quote toggles
      if (quoteTypes.test(part)&& !isInQuotes) {
        isInQuotes = true;
        part = part.replace(openQuotes, "");
      } else if (quoteTypes.test(part) && isInQuotes) {
        isInQuotes = false;
        part = part.replace(closeQuotes, "");
      }

      if (part) {
        words.push({
          text: part,
          isQuoted: isInQuotes,
        });
      }
    }

    return words;
  }

  window.parsePDF = async (file, onProgress = null) => {
    if (typeof pdfjsLib === "undefined") throw new Error("pdf.js missing");

    try {
      if (!file || file.type !== "application/pdf")
        throw new Error("Invalid PDF");
      if (file.size > 64 * 1024 * 1024) throw new Error("PDF too large");

      onProgress?.("Reading file...");
      const arrayBuffer = await file.arrayBuffer();

      onProgress?.("Loading PDF...");
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let pageContent = "";

      onProgress?.(`Parsing ${pdf.numPages} pages...`);

      // Accumulate all content
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        onProgress?.(`Page ${pageNum}/${pdf.numPages}`);

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => item.str.trim())
          .join(" ")
          .trim();

        pageContent += " " + pageText;
      }

      // Chapter detection - full document scan
      const fullText = pageContent.trim();
      const chapterRegex =
        /(?:Chapter|Ch\.?|Section|Part)\s+(?:[IVXCLM\d]+)?\s*\.?\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/gi;
      const chapterMatches = [...fullText.matchAll(chapterRegex)];

      let chapters = [];
      let pos = 0;

      chapterMatches.forEach((match) => {
        const title = match[1];
        const start = match.index;

        if (start > pos + 1000) {
          chapters.push({
            title: `Chapter ${chapters.length + 1}`,
            words: parseContentWithQuotes(fullText.slice(pos, start).trim()),
          });
        }

        pos = start + title.length + 100;
      });

      chapters.push({
        title: "Conclusion",
        words: parseContentWithQuotes(fullText.slice(pos).trim()),
      });

      if (chapterMatches.length === 0) {
        chapters = [
          {
            title: "Document",
            words: parseContentWithQuotes(fullText),
          },
        ];
      }

      console.log(`Enhanced parser: ${chapterMatches.length} chapters found`);

      onProgress?.(`Success! ${chapters.length} chapters parsed`);

      return {
        fileName: file.name,
        chapters,
      };
    } catch (error) {
      console.error("PDF parse failed:", error);
      throw new Error(error.message || "Parse failed");
    }
  };

  console.log("PDF Parser ready - Fancy quotes supported");
})();
