// RSVP Speed Reader - Production Ready Vanilla JS

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

// Color settings state (defaults)
let textColor = '#f0f0f0';
let focusColor = '#ff4444';
let markerColor = '#4caf50';
let bgColor = '#0a0a0a';

// Elements - direct ID mapping
let statusEl, fileInputEl, hamburgerBtnEl, drawerMenuEl, drawerScrimEl, chapterListEl, rsvpDisplayEl;
let wpmDisplayMainEl, chapterEtaEl, bookEtaEl, chapterProgressEl, bookProgressEl, playBtnEl, pauseBtnEl, resetBtnEl, prev10BtnEl, next10BtnEl, settingsBtnEl;

// Settings elements
let settingsDrawerEl, settingsScrimEl;
let wpmSliderMdEl, wpmDisplaySettingsEl, adaptiveToggleMdEl;
let textColorInputEl, textColorBtnEl, textColorPreviewEl;
let focusColorInputEl, focusColorBtnEl, focusColorPreviewEl;
let markerColorInputEl, markerColorBtnEl, markerColorPreviewEl;
let bgColorInputEl, bgColorBtnEl, bgColorPreviewEl;
let fontSmallBtn, fontMediumBtn, fontLargeBtn;
let resetSettingsBtn, closeSettingsBtn;
let fontBtns;


document.addEventListener('DOMContentLoaded', () => {
  // Direct safe assignment
  statusEl = document.getElementById('status');
  fileInputEl = document.getElementById('fileInput');
  hamburgerBtnEl = document.getElementById('hamburger-menu');
  drawerMenuEl = document.getElementById('drawer-menu');
  drawerScrimEl = document.getElementById('drawer-scrim');
  chapterListEl = document.getElementById('chapter-list');
  rsvpDisplayEl = document.getElementById('rsvp-display');
  
  // Main controls
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
  
  // Settings - MD3 elements
  settingsDrawerEl = document.getElementById('settings-drawer');
  settingsScrimEl = document.getElementById('settings-scrim');
  wpmSliderMdEl = document.getElementById('wpm-slider-md');
  wpmDisplaySettingsEl = document.getElementById('wpm-display-settings');
  adaptiveToggleMdEl = document.getElementById('adaptive-toggle-md');
  
  // Color elements
  textColorInputEl = document.getElementById('text-color');
  textColorBtnEl = document.getElementById('text-color-btn');
  textColorPreviewEl = document.getElementById('text-color-preview');
  focusColorInputEl = document.getElementById('focus-color');
  focusColorBtnEl = document.getElementById('focus-color-btn');
  focusColorPreviewEl = document.getElementById('focus-color-preview');
  markerColorInputEl = document.getElementById('marker-color');
  markerColorBtnEl = document.getElementById('marker-color-btn');
  markerColorPreviewEl = document.getElementById('marker-color-preview');
  bgColorInputEl = document.getElementById('bg-color');
  bgColorBtnEl = document.getElementById('bg-color-btn');
  bgColorPreviewEl = document.getElementById('bg-color-preview');
  
  // Font segmented buttons
  fontSmallBtn = document.getElementById('font-small');
  fontMediumBtn = document.getElementById('font-medium');
  fontLargeBtn = document.getElementById('font-large');
  
  // Action buttons
  resetSettingsBtn = document.getElementById('reset-settings');
  closeSettingsBtn = document.getElementById('close-settings');

  fontBtns = [fontSmallBtn, fontMediumBtn, fontLargeBtn];


  // Safety checks
  if (!playBtnEl || !rsvpDisplayEl) {
    console.error('Critical elements missing - check HTML IDs');
    return;
  }

  // Event bindings with null checks
  // Main controls
  if (playBtnEl) playBtnEl.addEventListener('click', play);
  if (pauseBtnEl) pauseBtnEl.addEventListener('click', pause);
  if (resetBtnEl) resetBtnEl.addEventListener('click', reset);
  if (prev10BtnEl) prev10BtnEl.addEventListener('click', () => scrubWords(-10));
  if (next10BtnEl) next10BtnEl.addEventListener('click', () => scrubWords(10));
  if (settingsBtnEl) settingsBtnEl.addEventListener('click', toggleSettingsDrawer);
  if (hamburgerBtnEl) hamburgerBtnEl.addEventListener('click', toggleDrawer);
  if (drawerScrimEl) drawerScrimEl.addEventListener('click', closeDrawer);
  if (settingsScrimEl) settingsScrimEl.addEventListener('click', closeSettingsDrawer);
  if (fileInputEl) fileInputEl.addEventListener('change', handleFileInput);
  
  // Settings bindings (will sync later)
  // Bind MD3 settings events
  if (wpmSliderMdEl) wpmSliderMdEl.addEventListener('input', (e) => onWpmChange(e.target.value));
  if (wpmSliderMdEl) wpmDisplaySettingsEl.textContent = `${wpm} WPM`;
  if (adaptiveToggleMdEl) adaptiveToggleMdEl.addEventListener('change', toggleAdaptive);
  
  // Color pickers
  if (textColorInputEl) textColorInputEl.addEventListener('input', (e) => updateColor('text', e.target.value));
  if (focusColorInputEl) focusColorInputEl.addEventListener('input', (e) => updateColor('focus', e.target.value));
  if (markerColorInputEl) markerColorInputEl.addEventListener('input', (e) => updateColor('marker', e.target.value));
  if (bgColorInputEl) bgColorInputEl.addEventListener('input', (e) => updateColor('bg', e.target.value));
  
  // Color buttons toggle pickers
  if (textColorBtnEl) textColorBtnEl.addEventListener('click', () => toggleColorPicker('text'));
  if (focusColorBtnEl) focusColorBtnEl.addEventListener('click', () => toggleColorPicker('focus'));
  if (markerColorBtnEl) markerColorBtnEl.addEventListener('click', () => toggleColorPicker('marker'));
  if (bgColorBtnEl) bgColorBtnEl.addEventListener('click', () => toggleColorPicker('bg'));
  
  // Font segmented buttons
  if (fontSmallBtn) fontSmallBtn.addEventListener('click', () => setFontSize(2));
  if (fontMediumBtn) fontMediumBtn.addEventListener('click', () => setFontSize(4));
  if (fontLargeBtn) fontLargeBtn.addEventListener('click', () => setFontSize(6));
  
  // Actions
  if (resetSettingsBtn) resetSettingsBtn.addEventListener('click', resetSettings);
  if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettingsDrawer);
  
  document.addEventListener('keydown', onKeyDown);

  // Init settings
  loadSettings();
  updateWpmDisplay();
  updateEtaDisplay();
  displayWelcome();
  if (rsvpDisplayEl) rsvpDisplayEl.style.fontSize = `${fontSizeRem}rem`;

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
  if (settingsDrawerEl.classList.contains('open')) {
    closeSettingsDrawer();
  } else {
    syncSettingsUI();
    settingsDrawerEl.classList.add('open');
    settingsScrimEl.classList.add('open');
  }
}

function syncSettingsUI() {
  if (wpmSliderMdEl) wpmSliderMdEl.value = wpm;
  if (wpmDisplaySettingsEl) wpmDisplaySettingsEl.textContent = `${wpm} WPM`;
  if (adaptiveToggleMdEl) adaptiveToggleMdEl.checked = adaptiveMode;
  
  // Font buttons
  [fontSmallBtn, fontMediumBtn, fontLargeBtn].forEach(btn => { if (btn) btn.selected = false; });
  if (fontSizeRem === 2 && fontSmallBtn) fontSmallBtn.selected = true;
  else if (fontSizeRem === 4 && fontMediumBtn) fontMediumBtn.selected = true;
  else if (fontLargeBtn) fontLargeBtn.selected = true;
  
  // Colors
  if (textColorInputEl) textColorInputEl.value = textColor;
  if (textColorPreviewEl) textColorPreviewEl.textContent = textColor;
  if (focusColorInputEl) focusColorInputEl.value = focusColor;
  if (focusColorPreviewEl) focusColorPreviewEl.textContent = focusColor;
  if (markerColorInputEl) markerColorInputEl.value = markerColor;
  if (markerColorPreviewEl) markerColorPreviewEl.textContent = markerColor;
  if (bgColorInputEl) bgColorInputEl.value = bgColor;
  if (bgColorPreviewEl) bgColorPreviewEl.textContent = bgColor;
}

function closeSettingsDrawer() {
  settingsDrawerEl.classList.remove('open');
  settingsScrimEl.classList.remove('open');
}

function onFontSizeBtn(e) {
  const size = parseFloat(e.target.dataset.size);
  fontSizeRem = size;
  rsvpDisplayEl.style.fontSize = `${size}rem`;
  
  // Update button states
  fontBtns.forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
  
  closeSettingsDrawer();
}

function toggleAdaptive() {
  adaptiveMode = !adaptiveMode;
  if (adaptiveToggleEl) {
    adaptiveToggleEl.classList.toggle('active', adaptiveMode);
  }
  if (isPlaying) pause();
}

function onFontSizeChange() {
  if (fontSizeSliderEl) {
    fontSizeRem = parseFloat(fontSizeSliderEl.value);
    if (rsvpDisplayEl) rsvpDisplayEl.style.fontSize = `${fontSizeRem}rem`;
  }
}

function handleFileInput(event) {
  if (!fileInputEl || !event.target.files[0]) return;
  const file = event.target.files[0];
  
  if (statusEl) statusEl.textContent = 'Processing PDF...';

  import('./parser.js').then(({ parsePDF }) => {
    parsePDF(file).then(data => {
      chaptersData = data;
      totalBookWords = data.chapters.reduce((sum, ch) => sum + ch.content.split(/\s+/).filter(w => w.trim()).length, 0);
      if (statusEl) statusEl.textContent = `Ready! ${data.chapters.length} chapters, ${totalBookWords} words.`;
      populateChapterList();
      displayWord(0);
    }).catch(err => {
      if (statusEl) statusEl.textContent = 'Error parsing file.';
      console.error(err);
    });
  });

}

function populateChapterList() {
  if (!chapterListEl || !chaptersData) return;
  chapterListEl.innerHTML = chaptersData.chapters.map((ch, i) => 
    `<li data-chapter="${i}" class="${i === currentChapterIndex ? 'active' : ''}">${ch.title}</li>`
  ).join('');
  
  // Rebind click for new list items
  if (chapterListEl) {
    chapterListEl.removeEventListener('click', onChapterListClick);
    chapterListEl.addEventListener('click', onChapterListClick);
  }
  
  loadCurrentChapter();
}

// Removed old chapter modal functions - drawer replaces

// Chapter list click handler
function onChapterListClick(e) {
  const li = e.target.closest('li[data-chapter]');
  if (!li || !chapterListEl) return;
  const index = parseInt(li.dataset.chapter);
  currentChapterIndex = index;
  loadCurrentChapter();
  reset();
  populateChapterList(); // Re-highlight
  closeDrawer();
}

function loadCurrentChapter() {
  if (!chaptersData) return;
  const content = chaptersData.chapters[currentChapterIndex].content;
  words = content.split(/\s+/).map(w => w.trim()).filter(w => w);
  avgWordLen = words.reduce((sum, w) => sum + w.length, 0) / words.length || 5;
  currentWordIndex = 0;
  updateProgress();
  updateEtaDisplay();
}

function isTitleLike(word) {
  return /^(Chapter|Section|Part|CHAPTER|SECTION|^\w+[:]$|^\w{6,}$|^\d+$)/i.test(word) || 
         word.length > 10 && /^[A-Z]/.test(word);
}

function displayWelcome() {
  if (rsvpDisplayEl) rsvpDisplayEl.textContent = 'Upload a PDF to start reading';
}

function displayWord(index) {
  if (index >= words.length || !rsvpDisplayEl) {
    pause();
    rsvpDisplayEl.textContent = 'End of chapter';
    return;
  }

  const word = words[index];
  const focusIndex = Math.floor(word.length * 0.35) || 0;
  const prefix = word.slice(0, focusIndex);
  const focusChar = word[focusIndex] || '';
  const suffix = word.slice(focusIndex + 1);

  currentWordIndex = index;
  
  // Clear existing marker
  const existingMarker = rsvpDisplayEl.querySelector('.rsvp-marker');
  if (existingMarker) existingMarker.remove();
  
  rsvpDisplayEl.innerHTML = `${prefix}<span class="focus">${focusChar}</span>${suffix}`;
  
  // Add RSVP marker
  const marker = document.createElement('div');
  marker.className = 'rsvp-marker';
  rsvpDisplayEl.appendChild(marker);
  
  updateProgress();
  updateEtaDisplay();
}

function nextWord() {
  if (currentWordIndex >= words.length - 1) {
    pause();
    if (rsvpDisplayEl) rsvpDisplayEl.textContent = 'End of chapter';
    return;
  }

  const nextWordText = words[currentWordIndex + 1];
  if (isTitleLike(nextWordText)) {
    // Title pause - plain bold, no purple (per feedback)
    if (rsvpDisplayEl) rsvpDisplayEl.innerHTML = `<span style="font-weight: bold; font-size: 1.1em;">${nextWordText}</span>`;
    currentTimeout = setTimeout(() => {
      displayWord(currentWordIndex + 1);
      if (isPlaying) nextWord();
    }, 10);
    return;
  }

  // Subtle adaptive: +10-25ms only for long/punct (normal appearance)
  let baseDelay = 60000 / wpm;
  if (adaptiveMode) {
    let adaptiveDelay = baseDelay * (nextWordText.length / avgWordLen);
    let extraMs = 0;
    if (nextWordText.length > 8) extraMs += adaptiveDelay; // long words
    if (/[.!?;]/.test(nextWordText)) extraMs += adaptiveDelay/2; // sentence end
    else if (/[,:;]/.test(nextWordText)) extraMs += adaptiveDelay/3; // comma pause
    baseDelay += extraMs;
  }
  const delay = Math.max(60, Math.round(baseDelay));
  
  currentTimeout = setTimeout(() => {
    displayWord(currentWordIndex + 1);
    if (isPlaying) nextWord();
  }, delay);
}

function play() {
  isPlaying = true;
  if (playBtnEl) playBtnEl.style.display = 'none';
  if (pauseBtnEl) pauseBtnEl.style.display = 'inline-flex';
  nextWord();
}

function pause() {
  isPlaying = false;
  if (currentTimeout) {
    clearTimeout(currentTimeout);
    currentTimeout = null;
  }
  if (playBtnEl) playBtnEl.style.display = 'inline-flex';
  if (pauseBtnEl) pauseBtnEl.style.display = 'none';
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
  // Chapter progress
  if (chapterProgressEl && words.length) {
    const chapterProgress = (currentWordIndex / words.length) * 100;
    chapterProgressEl.style.width = `${chapterProgress}%`;
  }
  
  // Book progress (chapter words / total book words)
  if (bookProgressEl && totalBookWords) {
    const bookProgress = (currentWordIndex / totalBookWords) * 100;
    bookProgressEl.style.width = `${bookProgress}%`;
  }
}

function updateEtaDisplay() {
  const avgDelayMs = 60000 / wpm;
  
  // Chapter ETA
  if (chapterEtaEl && words.length) {
    const remainingChapter = words.length - currentWordIndex;
    const chapterMins = Math.round(remainingChapter * avgDelayMs / 60000);
    chapterEtaEl.textContent = `Ch: ${chapterMins}m`;
  }
  
  // Book ETA
  if (bookEtaEl && totalBookWords) {
    const bookMins = Math.round(totalBookWords * avgDelayMs / 60000);
    bookEtaEl.textContent = `Book: ${bookMins}m`;
  }
  
  // Sync WPM main display
  if (wpmDisplayMainEl) wpmDisplayMainEl.textContent = `${wpm} WPM`;
}

function onWpmChange(value) {
  wpm = parseInt(value);
  if (wpmDisplayMainEl) wpmDisplayMainEl.textContent = `${wpm} WPM`;
  if (wpmDisplaySettingsEl) wpmDisplaySettingsEl.textContent = `${wpm} WPM`;
  updateEtaDisplay();
  saveSettings();
}

function toggleAdaptive() {
  adaptiveMode = adaptiveToggleMdEl.checked;
  if (isPlaying) pause();
  saveSettings();
}

function setFontSize(size) {
  fontSizeRem = size;
  if (rsvpDisplayEl) rsvpDisplayEl.style.fontSize = `${size}rem`;
  
  // Update button states (add/remove selected)
  [fontSmallBtn, fontMediumBtn, fontLargeBtn].forEach(btn => {
    if (btn) btn.selected = false;
  });
  const activeBtn = size === 2 ? fontSmallBtn : size === 4 ? fontMediumBtn : fontLargeBtn;
  if (activeBtn) activeBtn.selected = true;
  
  closeSettingsDrawer();
  saveSettings();
}

function updateColor(type, value) {
  switch(type) {
    case 'text': textColor = value; break;
    case 'focus': focusColor = value; break;
    case 'marker': markerColor = value; break;
    case 'bg': bgColor = value; break;
  }
  
  // Update CSS var
  document.documentElement.style.setProperty(`--${type}-color`, value);
  
  // Update preview
  const previewEl = document.getElementById(`${type}-color-preview`);
  if (previewEl) previewEl.textContent = value;
  
  // Apply immediately to RSVP if visible
  if (rsvpDisplayEl) rsvpDisplayEl.style.color = textColor;
  
  saveSettings();
}

function toggleColorPicker(type) {
  const input = document.getElementById(`${type}-color`);
  input.style.display = input.style.display === 'block' ? 'none' : 'block';
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
      
      // Apply CSS vars
      document.documentElement.style.setProperty('--text-color', textColor);
      document.documentElement.style.setProperty('--focus-color', focusColor);
      document.documentElement.style.setProperty('--marker-color', markerColor);
      document.documentElement.style.setProperty('--bg-color', bgColor);
      
      // Update previews
      if (textColorPreviewEl) textColorPreviewEl.textContent = textColor;
      if (focusColorPreviewEl) focusColorPreviewEl.textContent = focusColor;
      if (markerColorPreviewEl) markerColorPreviewEl.textContent = markerColor;
      if (bgColorPreviewEl) bgColorPreviewEl.textContent = bgColor;
      
      if (wpmSliderMdEl) wpmSliderMdEl.value = wpm;
      if (adaptiveToggleMdEl) adaptiveToggleMdEl.checked = adaptiveMode;
      if (rsvpDisplayEl) {
        rsvpDisplayEl.style.fontSize = `${fontSizeRem}rem`;
        rsvpDisplayEl.style.color = textColor;
        document.body.style.background = bgColor;
      }
    }
  } catch (e) {
    console.warn('Failed to load settings:', e);
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
  
  // Reset UI
  if (wpmSliderMdEl) wpmSliderMdEl.value = 300;
  if (adaptiveToggleMdEl) adaptiveToggleMdEl.checked = false;
  [fontSmallBtn, fontMediumBtn, fontLargeBtn].forEach(btn => { if (btn) btn.selected = false; });
  if (fontMediumBtn) fontMediumBtn.selected = true;
  if (rsvpDisplayEl) rsvpDisplayEl.style.fontSize = '4rem';
  
  // Reset CSS vars
  document.documentElement.style.setProperty('--text-color', textColor);
  document.documentElement.style.setProperty('--focus-color', focusColor);
  document.documentElement.style.setProperty('--marker-color', markerColor);
  document.documentElement.style.setProperty('--bg-color', bgColor);
  
  localStorage.removeItem('speedReaderSettings');
  updateWpmDisplay();
  updateEtaDisplay();
  closeSettingsDrawer();
}

function updateWpmDisplay() {
  if (wpmDisplayEl) wpmDisplayEl.textContent = `${wpm} WPM`;
}

function onKeyDown(e) {
  e.preventDefault();
  switch(e.code) {
    case 'Space':
      if (isPlaying) pause();
      else play();
      break;
    case 'ArrowLeft': scrubWords(-10); break;
    case 'ArrowRight': scrubWords(10); break;
    case 'ArrowUp': 
      wpm = Math.min(1000, wpm + 50);
      if (wpmSliderMdEl) wpmSliderMdEl.value = wpm;
      updateWpmDisplay();
      updateEtaDisplay();
      break;
    case 'ArrowDown': 
      wpm = Math.max(100, wpm - 50);
      if (wpmSliderMdEl) wpmSliderMdEl.value = wpm;
      updateWpmDisplay();
      updateEtaDisplay();
      break;
  }
}

function updateWpmDisplay() {
  if (wpmDisplayMainEl) wpmDisplayMainEl.textContent = `${wpm} WPM`;
}

