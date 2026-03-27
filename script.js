// RSVP Speed Reader - FIXED Settings with Native Controls

// Global state
let chaptersData = null;
let currentChapterIndex = 0;
let words = [];
let currentWordIndex = 0;
let isPlaying = false;
let wpm = 500;
let adaptiveMode = false;
let avgWordLen = 5;
let totalBookWords = 0;
let fontSizeRem = 4;
let currentTimeout = null;

// Color settings state
let textColor = "#f0f0f0";
let focusColor = "#ff4444";
let markerColor = "#4caf50";
let bgColor = "#0a0a0a";

// Elements
let fileInputEl,
  hamburgerBtnEl,
  drawerMenuEl,
  drawerScrimEl,
  chapterListEl,
  rsvpDisplayEl;

let welcomeMenuEl,
  pasteTextBtnEl,
  textInputSectionEl,
  textInputEl,
  startTextBtnEl;
let wpmDisplayMainEl,
  chapterEtaEl,
  bookEtaEl,
  chapterProgressEl,
  bookProgressEl,
  playBtnEl,
  pauseBtnEl,
  resetBtnEl,
  prev10BtnEl,
  next10BtnEl,
  settingsBtnEl;
let settingsDrawerEl, settingsScrimEl;
let wpmDecreaseBtn, wpmIncreaseBtn, wpmDisplaySettings, adaptiveToggle;
let textColorInput, textColorBtn, textColorPreview;
let focusColorInput, focusColorBtn, focusColorPreview;
let markerColorInput, markerColorBtn, markerColorPreview;
let bgColorInput, bgColorBtn, bgColorPreview;
let fontSmallBtn, fontMediumBtn, fontLargeBtn;
let resetSettingsBtn, closeSettingsBtn;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Speed Reader init");

  // Get elements
  // statusEl removed
  fileInputEl = document.getElementById("fileInput");
  drawerMenuEl = document.getElementById("drawer-menu");
  drawerScrimEl = document.getElementById("drawer-scrim");
  chapterListEl = document.getElementById("chapter-list");
  rsvpDisplayEl = document.getElementById("rsvp-display");
  welcomeMenuEl = document.getElementById("welcome-menu");
  pasteTextBtnEl = document.getElementById("paste-text-btn");
  textInputSectionEl = document.getElementById("text-input-section");
  textInputEl = document.getElementById("text-input");
  startTextBtnEl = document.getElementById("start-text-btn");
  wpmDisplayMainEl = document.getElementById("wpm-display");
  chapterEtaEl = document.getElementById("chapter-eta");
  bookEtaEl = document.getElementById("book-eta");
  chapterProgressEl = document.getElementById("chapter-progress");
  bookProgressEl = document.getElementById("book-progress");
  playBtnEl = document.getElementById("play-btn");
  pauseBtnEl = document.getElementById("pause-btn");
  resetBtnEl = document.getElementById("reset-btn");
  prev10BtnEl = document.getElementById("prev-10");
  next10BtnEl = document.getElementById("next-10");
  settingsBtnEl = document.getElementById("settings-btn");

  // Settings elements - NATIVE
  settingsDrawerEl = document.getElementById("settings-drawer");
  settingsScrimEl = document.getElementById("settings-scrim");
  wpmDecreaseBtn = document.getElementById("wpm-decrease");
  wpmIncreaseBtn = document.getElementById("wpm-increase");
  wpmDisplaySettings = document.getElementById("wpm-display-settings");
  adaptiveToggle = document.getElementById("adaptive-toggle");
  textColorInput = document.getElementById("text-color");
  textColorBtn = document.getElementById("text-color-btn");
  textColorPreview = document.getElementById("text-color-preview");
  focusColorInput = document.getElementById("focus-color");
  focusColorBtn = document.getElementById("focus-color-btn");
  focusColorPreview = document.getElementById("focus-color-preview");
  markerColorInput = document.getElementById("marker-color");
  markerColorBtn = document.getElementById("marker-color-btn");
  markerColorPreview = document.getElementById("marker-color-preview");
  bgColorInput = document.getElementById("bg-color");
  bgColorBtn = document.getElementById("bg-color-btn");
  bgColorPreview = document.getElementById("bg-color-preview");
  fontSmallBtn = document.getElementById("font-small");
  fontMediumBtn = document.getElementById("font-medium");
  fontLargeBtn = document.getElementById("font-large");
  resetSettingsBtn = document.getElementById("reset-settings");
  closeSettingsBtn = document.getElementById("close-settings");

  // Safety checks
  if (!rsvpDisplayEl || !playBtnEl)
    return console.error("Missing critical elements");

  // Event listeners
  if (settingsBtnEl)
    settingsBtnEl.addEventListener("click", toggleSettingsDrawer);
  /* Chapter bar always visible after load, no toggle */
  if (settingsScrimEl)
    settingsScrimEl.addEventListener("click", closeSettingsDrawer);
  if (fileInputEl)
    fileInputEl.addEventListener("change", () => {
      handleFileInput(event);
    });
  if (pasteTextBtnEl) pasteTextBtnEl.addEventListener("click", toggleTextInput);
  if (startTextBtnEl) startTextBtnEl.addEventListener("click", handleTextInput);
  if (playBtnEl) playBtnEl.addEventListener("click", play);
  if (pauseBtnEl) pauseBtnEl.addEventListener("click", pause);
  if (resetBtnEl) resetBtnEl.addEventListener("click", reset);
  if (prev10BtnEl) prev10BtnEl.addEventListener("click", () => scrubWords(-10));
  if (next10BtnEl) next10BtnEl.addEventListener("click", () => scrubWords(10));

  // WPM buttons
  if (wpmDecreaseBtn)
    wpmDecreaseBtn.addEventListener("click", () => {
      wpm = Math.max(100, wpm - 25);
      onWpmChange(wpm);
    });
  if (wpmIncreaseBtn)
    wpmIncreaseBtn.addEventListener("click", () => {
      wpm = Math.min(1000, wpm + 25);
      onWpmChange(wpm);
    });
  if (adaptiveToggle)
    adaptiveToggle.addEventListener(
      "change",
      (e) => (adaptiveMode = e.target.checked),
    );
  if (textColorInput)
    textColorInput.addEventListener("change", (e) =>
      updateColor("text", e.target.value),
    );
  if (focusColorInput)
    focusColorInput.addEventListener("change", (e) =>
      updateColor("focus", e.target.value),
    );
  if (markerColorInput)
    markerColorInput.addEventListener("change", (e) =>
      updateColor("marker", e.target.value),
    );
  if (bgColorInput)
    bgColorInput.addEventListener("change", (e) =>
      updateColor("bg", e.target.value),
    );
  if (fontSmallBtn)
    fontSmallBtn.addEventListener("click", () => setFontSize(2));
  if (fontMediumBtn)
    fontMediumBtn.addEventListener("click", () => setFontSize(4));
  if (fontLargeBtn)
    fontLargeBtn.addEventListener("click", () => setFontSize(6));
  if (resetSettingsBtn)
    resetSettingsBtn.addEventListener("click", resetSettings);
  if (closeSettingsBtn)
    closeSettingsBtn.addEventListener("click", closeSettingsDrawer);

  if (textColorBtn)
    textColorBtn.addEventListener("click", () => textColorInput.click());
  if (focusColorBtn)
    focusColorBtn.addEventListener("click", () => focusColorInput.click());
  if (markerColorBtn)
    markerColorBtn.addEventListener("click", () => markerColorInput.click());
  if (bgColorBtn)
    bgColorBtn.addEventListener("click", () => bgColorInput.click());

  document.addEventListener("keydown", onKeyDown);

  // Init
  loadSettings();
  updateDisplays();
  displayWelcome();
  console.log("Speed Reader ready");
});
/**
 * RSVP Dynamic Delay Calculator
 * Senior Frontend Engineer + Linguistics Researcher Implementation
 */

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "can",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "me",
  "him",
  "her",
  "us",
  "them",
  "my",
  "your",
  "his",
  "its",
  "our",
  "their",
  "mine",
  "yours",
  "hers",
  "ours",
  "theirs",
  "as",
  "if",
  "from",
  "about",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "up",
  "down",
  "out",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "s",
  "t",
  "can",
  "will",
  "just",
  "don",
  "should",
  "now",
]);

/**
 * Calculates dynamic display delay for RSVP word
 * @param {string} word - The word to display
 * @param {number} baseMsPerWord - Base milliseconds per word from WPM (60000 / wpm)
 * @returns {number} Delay in milliseconds
 */
function calculateRsvpDelay(word, baseMsPerWord) {
  if (!word || typeof word !== "string") return baseMsPerWord;

  const cleanWord = word.trim();
  const lowerWord = cleanWord.toLowerCase();
  const rawLength = lowerWord.replace(/[^\w]/g, "").length;
  let delay = baseMsPerWord;

  // 1. Length Scaling
  if (rawLength > 5) {
    const extraLetters = rawLength - 5;
    delay += extraLetters * (baseMsPerWord * 0.15);
  }

  // 2. Detection Logic
  const isSentenceEnd = /[.!?]/.test(cleanWord);
  const isClauseEnd = /[,;:]/.test(cleanWord);
  const isNumeric = /\d/.test(cleanWord);
  // Detects "1." or "20." specifically
  const isListItem = /^\d+\.$/.test(cleanWord);

  // 3. Complexity Weighting
  // Borrow time from stop words, but never if they have punctuation
  if (STOP_WORDS.has(lowerWord) && !isSentenceEnd && !isClauseEnd) {
    delay *= 0.8;
  }

  // 4. Prioritization logic (The "Anti-Stacking" fix)
  if (isListItem) {
    // List items (1.) should be clear but faster than a full sentence end
    delay = Math.max(delay, baseMsPerWord * 1.5);
  } else if (isSentenceEnd) {
    delay = Math.max(delay, baseMsPerWord * 2.5);
  } else if (isClauseEnd) {
    delay = Math.max(delay, baseMsPerWord * 1.5);
  } else if (isNumeric) {
    delay = Math.max(delay, baseMsPerWord * 1.3);
  }

  // 5. Hard Constraints
  // Floor at 100ms prevents "visual flicker" and retinal ghosting
  // Cap at 2.5x base keeps the "flow state" from breaking
  const finalDelay = Math.max(100, Math.min(delay, baseMsPerWord * 2.5));

  // Console log for debugging the rhythm
  console.log(
    `Word: "${word}", Base: ${baseMsPerWord.toFixed(1)}ms, Final: ${finalDelay.toFixed(1)}ms`,
  );

  return Math.round(finalDelay);
}

/**
 * Batch calculate delays for word array (preserves average WPM)
 * @param {string[]} words - Array of words
 * @param {number} wpm - Words per minute
 * @returns {number[]} Array of delays matching word lengths
 */
function calculateBatchDelays(words, wpm) {
  const baseMsPerWord = 60000 / wpm;
  return words.map((word) => calculateRsvpDelay(word, baseMsPerWord));
}
// Usage example:
/*
const delays = calculateBatchDelays(['the', 'internationalization', 'project.', 'ends', 'now'], 350);
console.log(delays); // [~163, ~389, ~413, ~230, ~207]
const totalTime = delays.reduce((a, b) => a + b, 0);
const effectiveWPM = (delays.length / totalTime) * 60000; // ~350 (preserved)
*/

function toggleSettingsDrawer() {
  settingsDrawerEl.classList.toggle("open");
  settingsScrimEl.classList.toggle("open");
  if (settingsDrawerEl.classList.contains("open")) syncSettingsUI();
}

function syncSettingsUI() {
  if (wpmDisplaySettings) wpmDisplaySettings.innerHTML = `${wpm}<br>WPM`;

  if (adaptiveToggle) adaptiveToggle.checked = adaptiveMode;
  if (textColorInput) textColorInput.value = textColor;
  if (textColorPreview) textColorPreview.textContent = textColor;
  if (focusColorInput) focusColorInput.value = focusColor;
  if (focusColorPreview) focusColorPreview.textContent = focusColor;
  if (markerColorInput) markerColorInput.value = markerColor;
  if (markerColorPreview) markerColorPreview.textContent = markerColor;
  if (bgColorInput) bgColorInput.value = bgColor;
  if (bgColorPreview) bgColorPreview.textContent = bgColor;

  // Font buttons
  [fontSmallBtn, fontMediumBtn, fontLargeBtn].forEach((btn) =>
    btn?.classList.remove("active"),
  );
  const activeFont =
    fontSizeRem === 2
      ? fontSmallBtn
      : fontSizeRem === 4
        ? fontMediumBtn
        : fontLargeBtn;
  activeFont?.classList.add("active");
}

function closeSettingsDrawer() {
  settingsDrawerEl.classList.remove("open");
  settingsScrimEl.classList.remove("open");
}

function handleFileInput(e) {
  const file = e.target.files[0];
  if (!file) return;

  hideWelcomeMenu();
  console.log(`Loading ${file.name}...`);

  if (typeof window.parsePDF !== "function") {
    console.error("PDF parser not ready - refresh page");
    return;
  }

  pause();
  rsvpDisplayEl.textContent = "";

  window.parsePDF(file).then((data) => {
    chaptersData = data;
    totalBookWords = data.chapters.reduce(
      (sum, ch) => sum + (ch.words ? ch.words.length : 0),
      0,
    );
    wpmDisplayMainEl.innerHTML = `Ready! ${data.chapters.length} chapters`;
    setTimeout(() => (wpmDisplayMainEl.textContent = `${wpm} WPM`), 2000);
    populateChapterList();
    loadCurrentChapter();
    displayWord(0);
    fileInputEl.value = "";
  });
}

/**
 * Toggle the text input section visibility.
 */
function toggleTextInput() {
  /**
   * Check if the text input section is hidden or not.
   * If it is hidden, show it and focus the text input element.
   * If it is not hidden, hide it.
   */
  if (
    textInputSectionEl.style.display === "none" ||
    !textInputSectionEl.style.display
  ) {
    // Show the text input section and focus the text input element.
    textInputSectionEl.style.display = "block";
    textInputEl.focus();
  } else {
    // Hide the text input section.
    textInputSectionEl.style.display = "none";
  }
}

function handleTextInput() {
  const text = textInputEl.value.trim();
  if (!text) {
    rsvpDisplayEl.textContent = "Please enter some text";
    setTimeout(() => (rsvpDisplayEl.textContent = ""), 2000);
    return;
  }

  hideWelcomeMenu();
  rsvpDisplayEl.textContent = "Processing text...";

  const textWords = text
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w)
    .map((w) => ({
      text: w,
      isQuoted: false,
    }));

  chaptersData = {
    chapters: [
      {
        title: "Pasted Text",
        words: textWords,
      },
    ],
  };

  totalBookWords = textWords.length;
  wpmDisplayMainEl.innerHTML = `Ready! 1 chapter (${totalBookWords} words)`;
  setTimeout(() => (wpmDisplayMainEl.textContent = `${wpm} WPM`), 2000);

  populateChapterList();
  loadCurrentChapter();
  displayWord(0);
}

function hideWelcomeMenu() {
  if (welcomeMenuEl) welcomeMenuEl.style.display = "none";
  if (document.querySelector(".rsvp-container")) {
    document.querySelector(".rsvp-container").classList.add("active");
  }
}

function populateChapterList() {
  if (!chaptersData) return;
  chapterListEl.innerHTML = chaptersData.chapters
    .map(
      (ch, i) =>
        `<li data-chapter="${i}" class="${i === currentChapterIndex ? "active" : ""}">${ch.title}</li>`,
    )
    .join("");

  chapterListEl.querySelectorAll("li").forEach((li, i) => {
    li.addEventListener("click", () => {
      currentChapterIndex = i;
      loadCurrentChapter();
      reset();
      populateChapterList();
    });
  });

  // Scroll to make current chapter visible (half last item visible on overflow)
  const currentLi = chapterListEl.querySelector(
    `li[data-chapter="${currentChapterIndex}"]`,
  );
  if (currentLi) {
    currentLi.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }

  loadCurrentChapter();
}

function loadCurrentChapter() {
  if (!chaptersData) return;
  const chapter = chaptersData.chapters[currentChapterIndex];

  const titleWord = {
    text: chapter.title,
    isTitle: true,
    duration: 1000,
    isQuoted: false,
  };

  words = [titleWord, ...(chapter.words || [])].filter((w) => w && w.text);

  currentWordIndex = 0;
  updateProgress();
  updateEtaDisplay();
}

// NEW: Modified displayWord for quote effect
function getOptimalFocusIndex(word) {
  const vowels = "aeiouAEIOU";
  for (let i = 1; i < word.length - 1; i++) {
    if (vowels.includes(word[i])) return i;
  }
  return Math.floor(word.length / 2);
}

function displayWord(index) {
  const wordObj = words[index];
  const word = wordObj.text;
  const focusIdx = getOptimalFocusIndex(word);
  const pre = word.slice(0, focusIdx);
  const focusChar = word[focusIdx];
  const post = word.slice(focusIdx + 1);

  rsvpDisplayEl.className = wordObj.isQuoted ? "quoted" : "";

  if (wordObj.isQuoted) {
    rsvpDisplayEl.style.fontFamily = '"Atkinson Hyperlegible", sans-serif';
    rsvpDisplayEl.innerHTML = `
      <div class="rsvp-band highlight">
        <span class="quote-mark open-quote">“</span>
        <div class="word-container ">
          <div class="vertical-guide top"></div>
          <div class="focus-point">
            <span class="prefocus">${pre}</span>
            <span class="focus">${focusChar}</span>
            <span class="postfocus">${post}</span>
          </div>
          <div class="vertical-guide bottom"></div>
        </div>
        <span class="quote-mark close-quote">”</span>
      </div>`;
  } else {
    rsvpDisplayEl.style.fontFamily = '"Atkinson Hyperlegible", sans-serif';
    rsvpDisplayEl.innerHTML = `
      <div class="rsvp-band">
        <div class="word-container">
          <div class="vertical-guide top"></div>
          <div class="focus-point">
            <span class="prefocus">${pre}</span>
            <span class="focus">${focusChar}</span>
            <span class="postfocus">${post}</span>
          </div>
          <div class="vertical-guide bottom"></div>
        </div>
      </div>`;
  }

  currentWordIndex = index;
  updateProgress();
  updateEtaDisplay();
}

function nextWord() {
  if (!words || !words.length || currentWordIndex >= words.length - 1)
    return displayWord(words.length - 1 || 0);

  // Use advanced RSVP delay calculator for CURRENT word's display duration
  const currentWordObj = words[currentWordIndex];
  const baseMsPerWord = 60000 / wpm;
  let delay = calculateRsvpDelay(currentWordObj.text, baseMsPerWord);

  // Override for chapter titles
  if (currentWordObj.isTitle) {
    delay = currentWordObj.duration || 1000;
  }

  delay = Math.max(80, delay);

  currentTimeout = setTimeout(() => {
    displayWord(currentWordIndex + 1);
    if (isPlaying) nextWord();
  }, delay);
}

function play() {
  if (!words || !words.length) {
    console.log("No words loaded");
    return;
  }
  isPlaying = true;
  playBtnEl.style.display = "none";
  pauseBtnEl.style.display = "flex";
  nextWord();
}

function pause() {
  isPlaying = false;
  if (currentTimeout) clearTimeout(currentTimeout);
  playBtnEl.style.display = "flex";
  pauseBtnEl.style.display = "none";
}

function reset() {
  pause();
  currentWordIndex = 0;
  displayWord(0);
}

function scrubWords(delta) {
  pause();
  currentWordIndex = Math.max(
    0,
    Math.min(words.length - 1, currentWordIndex + delta),
  );
  displayWord(currentWordIndex);
}

function updateProgress() {
  if (!chapterProgressEl || !words.length) return;
  const chProgress = (currentWordIndex / words.length) * 100;
  chapterProgressEl.style.width = `${chProgress}%`;
  if (bookProgressEl && totalBookWords) {
    bookProgressEl.style.width = `${(currentWordIndex / totalBookWords) * 100}%`;
  }
}

function updateEtaDisplay() {
  const msPerWord = 60000 / wpm;
  if (chapterEtaEl && words.length) {
    const chMins = Math.round(
      ((words.length - currentWordIndex) * msPerWord) / 60000,
    );
    chapterEtaEl.textContent = `Ch: ${chMins}m`;
  }
  if (bookEtaEl && totalBookWords) {
    const bookMins = Math.round(
      ((totalBookWords - currentWordIndex) * msPerWord) / 60000,
    );
    bookEtaEl.textContent = `Book: ${bookMins}m`;
  }
  if (wpmDisplayMainEl) wpmDisplayMainEl.textContent = `${wpm} WPM`;
}

function updateDisplays() {
  updateWpmDisplay();
  updateEtaDisplay();
}

function updateWpmDisplay() {
  if (wpmDisplayMainEl) wpmDisplayMainEl.innerHTML = `WPM<br>${wpm}`;
}

function onWpmChange(value) {
  wpm = value;
  if (wpmDisplaySettings) wpmDisplaySettings.textContent = `${wpm} WPM`;
  updateDisplays();
  saveSettings();
}

function setFontSize(size) {
  fontSizeRem = size;
  if (rsvpDisplayEl) rsvpDisplayEl.style.fontSize = `${size}rem`;

  [fontSmallBtn, fontMediumBtn, fontLargeBtn].forEach((btn) =>
    btn?.classList.remove("active"),
  );
  (size === 2
    ? fontSmallBtn
    : size === 4
      ? fontMediumBtn
      : fontLargeBtn
  )?.classList.add("active");

  saveSettings();
}

function updateColor(type, value) {
  const colors = {
    text: textColor,
    focus: focusColor,
    marker: markerColor,
    bg: bgColor,
  };
  colors[type] = value;
  textColor = colors.text;
  focusColor = colors.focus;
  markerColor = colors.marker;
  bgColor = colors.bg;

  document.documentElement.style.setProperty(`--${type}-color`, value);
  document.querySelector(`#${type}-color-preview`).textContent = value;

  if (type === "text" && rsvpDisplayEl) rsvpDisplayEl.style.color = value;
  if (type === "bg") document.body.style.background = value;

  saveSettings();
}

function toggleColorPicker(type) {
  document.getElementById(`${type}-color`).click();
}

function saveSettings() {
  localStorage.setItem(
    "speedReaderSettings",
    JSON.stringify({
      wpm,
      adaptiveMode,
      fontSizeRem,
      textColor,
      focusColor,
      markerColor,
      bgColor,
    }),
  );
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("speedReaderSettings"));
    if (saved) {
      wpm = saved.wpm || 500;
      adaptiveMode = saved.adaptiveMode || false;
      fontSizeRem = saved.fontSizeRem || 4;
      textColor = saved.textColor || "#f0f0f0";
      focusColor = saved.focusColor || "#ff4444";
      markerColor = saved.markerColor || "#4caf50";
      bgColor = saved.bgColor || "#0a0a0a";

      document.documentElement.style.setProperty("--text-color", textColor);
      document.documentElement.style.setProperty("--focus-color", focusColor);
      document.documentElement.style.setProperty("--marker-color", markerColor);
      document.documentElement.style.setProperty("--bg-color", bgColor);
      document.body.style.background = bgColor;

      syncSettingsUI();
    }
  } catch (e) {
    console.warn("Load settings failed:", e);
  }
}

function resetSettings() {
  wpm = 500;
  adaptiveMode = false;
  fontSizeRem = 4;
  textColor = "#f0f0f0";
  focusColor = "#ff4444";
  markerColor = "#4caf50";
  bgColor = "#0a0a0a";

  syncSettingsUI();
  updateDisplays();

  document.documentElement.style.setProperty("--text-color", textColor);
  document.documentElement.style.setProperty("--focus-color", focusColor);
  document.documentElement.style.setProperty("--marker-color", markerColor);
  document.documentElement.style.setProperty("--bg-color", bgColor);
  document.body.style.background = bgColor;

  localStorage.removeItem("speedReaderSettings");
  closeSettingsDrawer();
}

function onKeyDown(e) {
  if (e.target.tagName === "INPUT") return;

  switch (e.code) {
    case "Space":
      e.preventDefault();
      isPlaying ? pause() : play();
      break;
    case "ArrowLeft":
      scrubWords(-10);
      break;
    case "ArrowRight":
      scrubWords(10);
      break;
    case "ArrowUp":
      wpm = Math.min(1000, wpm + 50);
      onWpmChange(wpm);
      break;
    case "ArrowDown":
      wpm = Math.max(100, wpm - 50);
      onWpmChange(wpm);
      break;
  }
}

function displayWelcome() {
  rsvpDisplayEl.textContent = "Upload a PDF to start reading";
}
