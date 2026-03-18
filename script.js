// RSVP Speed Reader - FIXED Settings with Native Controls

// Global state
let chaptersData = null;
let currentChapterIndex = 0;
let words = [];
let currentWordIndex = 0;
let isPlaying = false;
let wpm = 300;
let adaptiveMode = false;
let avgWordLen = 5;
let totalBookWords = 0;
let fontSizeRem = 4;
let currentTimeout = null;

// Color settings state
let textColor = '#f0f0f0';
let focusColor = '#ff4444';
let markerColor = '#4caf50';
let bgColor = '#0a0a0a';

// Elements
let statusEl, fileInputEl, hamburgerBtnEl, drawerMenuEl, drawerScrimEl, chapterListEl, rsvpDisplayEl;
let wpmDisplayMainEl, chapterEtaEl, bookEtaEl, chapterProgressEl, bookProgressEl, playBtnEl, pauseBtnEl, resetBtnEl, prev10BtnEl, next10BtnEl, settingsBtnEl;
let settingsDrawerEl, settingsScrimEl;
let wpmSlider, wpmDisplaySettings, adaptiveToggle;
let textColorInput, textColorBtn, textColorPreview;
let focusColorInput, focusColorBtn, focusColorPreview;
let markerColorInput, markerColorBtn, markerColorPreview;
let bgColorInput, bgColorBtn, bgColorPreview;
let fontSmallBtn, fontMediumBtn, fontLargeBtn;
let resetSettingsBtn, closeSettingsBtn;

document.addEventListener('DOMContentLoaded', () => {
  console.log('Speed Reader init');
  
  // Get elements
  statusEl = document.getElementById('status');
  fileInputEl = document.getElementById('fileInput');
  hamburgerBtnEl = document.getElementById('hamburger-menu');
  drawerMenuEl = document.getElementById('drawer-menu');
  drawerScrimEl = document.getElementById('drawer-scrim');
  chapterListEl = document.getElementById('chapter-list');
  rsvpDisplayEl = document.getElementById('rsvp-display');
  wpmDisplayMainEl = document.getElementById('wpm-display');
  chapterEtaEl = document.getElementById('chapter-eta');
  bookEtaEl = document.getElementById('book-eta');
  chapterProgressEl = document.getElementById('chapter-progress');
  bookProgressEl = document.getElementById('book-progress');
  playBtnEl = document.getElementById('play-btn');
  pauseBtnEl = document.getElementById('pause-btn');
  resetBtnEl = document.getElementById('reset-btn');
  prev10BtnEl = document.getElementById('prev-10');
  next10BtnEl = document.getElementById('next-10');
  settingsBtnEl = document.getElementById('settings-btn');
  
  // Settings elements - NATIVE
  settingsDrawerEl = document.getElementById('settings-drawer');
  settingsScrimEl = document.getElementById('settings-scrim');
  wpmSlider = document.getElementById('wpm-slider');
  wpmDisplaySettings = document.getElementById('wpm-display-settings');
  adaptiveToggle = document.getElementById('adaptive-toggle');
  textColorInput = document.getElementById('text-color');
  textColorBtn = document.getElementById('text-color-btn');
  textColorPreview = document.getElementById('text-color-preview');
  focusColorInput = document.getElementById('focus-color');
  focusColorBtn = document.getElementById('focus-color-btn');
  focusColorPreview = document.getElementById('focus-color-preview');
  markerColorInput = document.getElementById('marker-color');
  markerColorBtn = document.getElementById('marker-color-btn');
  markerColorPreview = document.getElementById('marker-color-preview');
  bgColorInput = document.getElementById('bg-color');
  bgColorBtn = document.getElementById('bg-color-btn');
  bgColorPreview = document.getElementById('bg-color-preview');
  fontSmallBtn = document.getElementById('font-small');
  fontMediumBtn = document.getElementById('font-medium');
  fontLargeBtn = document.getElementById('font-large');
  resetSettingsBtn = document.getElementById('reset-settings');
  closeSettingsBtn = document.getElementById('close-settings');

  // Safety checks
  if (!rsvpDisplayEl || !playBtnEl) return console.error('Missing critical elements');

  // Event listeners
  if (settingsBtnEl) settingsBtnEl.addEventListener('click', toggleSettingsDrawer);
  if (hamburgerBtnEl) hamburgerBtnEl.addEventListener('click', toggleDrawer);
  if (drawerScrimEl) drawerScrimEl.addEventListener('click', closeDrawer);
  if (settingsScrimEl) settingsScrimEl.addEventListener('click', closeSettingsDrawer);
  if (fileInputEl) fileInputEl.addEventListener('change', handleFileInput);
  if (playBtnEl) playBtnEl.addEventListener('click', play);
  if (pauseBtnEl) pauseBtnEl.addEventListener('click', pause);
  if (resetBtnEl) resetBtnEl.addEventListener('click', reset);
  if (prev10BtnEl) prev10BtnEl.addEventListener('click', () => scrubWords(-10));
  if (next10BtnEl) next10BtnEl.addEventListener('click', () => scrubWords(10));

  // FIXED Settings listeners
  if (wpmSlider) wpmSlider.addEventListener('input', (e) => onWpmChange(parseInt(e.target.value)));
  if (adaptiveToggle) adaptiveToggle.addEventListener('change', (e) => adaptiveMode = e.target.checked);
  if (textColorInput) textColorInput.addEventListener('change', (e) => updateColor('text', e.target.value));
  if (focusColorInput) focusColorInput.addEventListener('change', (e) => updateColor('focus', e.target.value));
  if (markerColorInput) markerColorInput.addEventListener('change', (e) => updateColor('marker', e.target.value));
  if (bgColorInput) bgColorInput.addEventListener('change', (e) => updateColor('bg', e.target.value));
  if (fontSmallBtn) fontSmallBtn.addEventListener('click', () => setFontSize(2));
  if (fontMediumBtn) fontMediumBtn.addEventListener('click', () => setFontSize(4));
  if (fontLargeBtn) fontLargeBtn.addEventListener('click', () => setFontSize(6));
  if (resetSettingsBtn) resetSettingsBtn.addEventListener('click', resetSettings);
  if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettingsDrawer);
  
  if (textColorBtn) textColorBtn.addEventListener('click', () => textColorInput.click());
  if (focusColorBtn) focusColorBtn.addEventListener('click', () => focusColorInput.click());
  if (markerColorBtn) markerColorBtn.addEventListener('click', () => markerColorInput.click());
  if (bgColorBtn) bgColorBtn.addEventListener('click', () => bgColorInput.click());

  document.addEventListener('keydown', onKeyDown);

  // Init
  loadSettings();
  updateDisplays();
  displayWelcome();
  console.log('Speed Reader ready');
});

function toggleDrawer() {
  drawerMenuEl.classList.toggle('open');
  drawerScrimEl.classList.toggle('open');
}

function closeDrawer() {
  drawerMenuEl.classList.remove('open');
  drawerScrimEl.classList.remove('open');
}

function toggleSettingsDrawer() {
  settingsDrawerEl.classList.toggle('open');
  settingsScrimEl.classList.toggle('open');
  if (settingsDrawerEl.classList.contains('open')) syncSettingsUI();
}

function syncSettingsUI() {
  if (wpmSlider) wpmSlider.value = wpm;
  if (wpmDisplaySettings) wpmDisplaySettings.textContent = `${wpm} WPM`;
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
  [fontSmallBtn, fontMediumBtn, fontLargeBtn].forEach(btn => btn?.classList.remove('active'));
  const activeFont = fontSizeRem === 2 ? fontSmallBtn : fontSizeRem === 4 ? fontMediumBtn : fontLargeBtn;
  activeFont?.classList.add('active');
}

function closeSettingsDrawer() {
  settingsDrawerEl.classList.remove('open');
  settingsScrimEl.classList.remove('open');
}

function handleFileInput(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  statusEl.textContent = `Loading ${file.name}...`;
  
  if (typeof window.parsePDF !== 'function') {
    statusEl.textContent = 'PDF parser not ready - refresh';
    return;
  }
  
  pause();
  rsvpDisplayEl.textContent = '';
  
  window.parsePDF(file, msg => statusEl.textContent = msg)
    .then(data => {
      chaptersData = data;
      totalBookWords = data.chapters.reduce((sum, ch) => sum + ch.content.split(/\s+/).filter(Boolean).length, 0);
      statusEl.textContent = `Ready! ${data.chapters.length} chapters`;
      populateChapterList();
      loadCurrentChapter();
      displayWord(0);
      fileInputEl.value = '';
    })
    .catch(err => {
      statusEl.textContent = `Error: ${err.message}`;
      console.error(err);
    });
}

function populateChapterList() {
  if (!chaptersData) return;
  chapterListEl.innerHTML = chaptersData.chapters.map((ch, i) => 
    `<li data-chapter="${i}" class="${i === currentChapterIndex ? 'active' : ''}">${ch.title}</li>`
  ).join('');
  
  chapterListEl.querySelectorAll('li').forEach((li, i) => {
    li.addEventListener('click', () => {
      currentChapterIndex = i;
      loadCurrentChapter();
      reset();
      populateChapterList();
      closeDrawer();
    });
  });
  
  loadCurrentChapter();
}

function loadCurrentChapter() {
  if (!chaptersData) return;
  const content = chaptersData.chapters[currentChapterIndex]?.content || '';
  words = content.split(/\s+/).map(w => w.trim()).filter(w => w);
  avgWordLen = words.reduce((sum, w) => sum + w.length, 0) / words.length || 5;
  currentWordIndex = 0;
  updateProgress();
  updateEtaDisplay();
}

function displayWord(index) {
  if (!words || !words.length || index >= words.length || !rsvpDisplayEl) {
    rsvpDisplayEl.innerHTML = '';
    rsvpDisplayEl.textContent = words.length ? 'End of chapter' : 'No content loaded';
    pause();
    return;
  }
  
  const word = words[index];
  const focusIdx = Math.floor(word.length * 0.35) || 0;
  rsvpDisplayEl.innerHTML = `${word.slice(0, focusIdx)}<span class="focus">${word[focusIdx] || ''}</span>${word.slice(focusIdx + 1)}`;
  
  // Clear old marker
  const oldMarker = rsvpDisplayEl.querySelector('.rsvp-marker');
  oldMarker?.remove();
  
  // Add new marker
  const marker = document.createElement('div');
  marker.className = 'rsvp-marker';
  rsvpDisplayEl.appendChild(marker);
  
  currentWordIndex = index;
  updateProgress();
  updateEtaDisplay();
}

function nextWord() {
  if (!words || !words.length || currentWordIndex >= words.length - 1) return displayWord(words.length - 1 || 0);
  
  let delay = 60000 / wpm;
  const nextWordText = words[currentWordIndex + 1];
  if (adaptiveMode) {
    delay *= nextWordText.length / avgWordLen;
    if (nextWordText.length > 8) delay *= 1.2;
    if (/[.!?]/.test(nextWordText)) delay *= 1.5;
  }
  delay = Math.max(80, Math.round(delay));
  
  currentTimeout = setTimeout(() => {
    displayWord(currentWordIndex + 1);
    if (isPlaying) nextWord();
  }, delay);
}

function play() {
  if (!words || !words.length) {
    console.log('No words loaded');
    return;
  }
  isPlaying = true;
  playBtnEl.style.display = 'none';
  pauseBtnEl.style.display = 'flex';
  nextWord();
}

function pause() {
  isPlaying = false;
  if (currentTimeout) clearTimeout(currentTimeout);
  playBtnEl.style.display = 'flex';
  pauseBtnEl.style.display = 'none';
}

function reset() {
  pause();
  currentWordIndex = 0;
  displayWord(0);
}

function scrubWords(delta) {
  pause();
  currentWordIndex = Math.max(0, Math.min(words.length - 1, currentWordIndex + delta));
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
    const chMins = Math.round((words.length - currentWordIndex) * msPerWord / 60000);
    chapterEtaEl.textContent = `Ch: ${chMins}m`;
  }
  if (wpmDisplayMainEl) wpmDisplayMainEl.textContent = `${wpm} WPM`;
}

function updateDisplays() {
  updateWpmDisplay();
  updateEtaDisplay();
}

function updateWpmDisplay() {
  if (wpmDisplayMainEl) wpmDisplayMainEl.textContent = `${wpm} WPM`;
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
  
  [fontSmallBtn, fontMediumBtn, fontLargeBtn].forEach(btn => btn?.classList.remove('active'));
  (size === 2 ? fontSmallBtn : size === 4 ? fontMediumBtn : fontLargeBtn)?.classList.add('active');
  
  saveSettings();
}

function updateColor(type, value) {
  const colors = { text: textColor, focus: focusColor, marker: markerColor, bg: bgColor };
  colors[type] = value;
  textColor = colors.text;
  focusColor = colors.focus;
  markerColor = colors.marker;
  bgColor = colors.bg;
  
  document.documentElement.style.setProperty(`--${type}-color`, value);
  document.querySelector(`#${type}-color-preview`).textContent = value;
  
  if (type === 'text' && rsvpDisplayEl) rsvpDisplayEl.style.color = value;
  if (type === 'bg') document.body.style.background = value;
  
  saveSettings();
}

function toggleColorPicker(type) {
  document.getElementById(`${type}-color`).click();
}

function saveSettings() {
  localStorage.setItem('speedReaderSettings', JSON.stringify({
    wpm, adaptiveMode, fontSizeRem, textColor, focusColor, markerColor, bgColor
  }));
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('speedReaderSettings'));
    if (saved) {
      wpm = saved.wpm || 300;
      adaptiveMode = saved.adaptiveMode || false;
      fontSizeRem = saved.fontSizeRem || 4;
      textColor = saved.textColor || '#f0f0f0';
      focusColor = saved.focusColor || '#ff4444';
      markerColor = saved.markerColor || '#4caf50';
      bgColor = saved.bgColor || '#0a0a0a';
      
      document.documentElement.style.setProperty('--text-color', textColor);
      document.documentElement.style.setProperty('--focus-color', focusColor);
      document.documentElement.style.setProperty('--marker-color', markerColor);
      document.documentElement.style.setProperty('--bg-color', bgColor);
      document.body.style.background = bgColor;
      
      syncSettingsUI();
    }
  } catch (e) {
    console.warn('Load settings failed:', e);
  }
}

function resetSettings() {
  wpm = 300;
  adaptiveMode = false;
  fontSizeRem = 4;
  textColor = '#f0f0f0';
  focusColor = '#ff4444';
  markerColor = '#4caf50';
  bgColor = '#0a0a0a';
  
  syncSettingsUI();
  updateDisplays();
  
  document.documentElement.style.setProperty('--text-color', textColor);
  document.documentElement.style.setProperty('--focus-color', focusColor);
  document.documentElement.style.setProperty('--marker-color', markerColor);
  document.documentElement.style.setProperty('--bg-color', bgColor);
  document.body.style.background = bgColor;
  
  localStorage.removeItem('speedReaderSettings');
  closeSettingsDrawer();
}

function onKeyDown(e) {
  if (e.target.tagName === 'INPUT') return;
  
  switch(e.code) {
    case 'Space': 
      e.preventDefault();
      isPlaying ? pause() : play();
      break;
    case 'ArrowLeft': scrubWords(-10); break;
    case 'ArrowRight': scrubWords(10); break;
    case 'ArrowUp': 
      wpm = Math.min(1000, wpm + 50);
      wpmSlider.value = wpm;
      onWpmChange(wpm);
      break;
    case 'ArrowDown': 
      wpm = Math.max(100, wpm - 50);
      wpmSlider.value = wpm;
      onWpmChange(wpm);
      break;
  }
}

function displayWelcome() {
  rsvpDisplayEl.textContent = 'Upload a PDF to start reading';
}

