let _currentQuestions = [];
let _currentAnswers = [];
let _currentQuestionIndex = 0;
let _assignedLab = null;
let _assignedViaChiamata = false;
let _processingTimer = null;
let _terminalInterval = null;
let _logoClickCount = 0;
let _logoClickTimer = null;

const TERMINAL_LINES = [
  '> INIZIALIZZAZIONE SISTEMA...',
  '> CARICAMENTO PROFILO ATTITUDINALE...',
  '> ANALISI VETTORI EXPO / TECH / ART / BACK...',
  '> LABORATORI DISPONIBILI: ricerca in corso...',
  '> VARIANZA ASSI: calcolo completato',
  '> SELEZIONE DOMANDE DISCRIMINANTI: OK',
  '> PONDERAZIONE RISPOSTE: elaborazione...',
  '> MATCHING SCORE: applicazione modello...',
  '> ALGORITMO DISCERNIMENTO v2.3.1',
  '> CONFRONTO ATTITUDINI MULTIPLE...',
  '> CONFIDENCE LEVEL: 94.7%',
  '> VALIDAZIONE INCROCIATA: completata',
  '> PAREGGI RISOLTI: fill-ratio tie-break',
  '> ',
  '> >>> ASSEGNAZIONE CONFERMATA <<<',
];

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function renderStandby() {
  const labs = stateGetLabs();
  const grid = document.getElementById('labs-grid');
  grid.innerHTML = '';

  labs.forEach(lab => {
    const pct = Math.round((lab.occupied / lab.capacity) * 100);
    const full = lab.occupied >= lab.capacity;
    const card = document.createElement('div');
    card.className = 'lab-card' + (full ? ' lab-full' : '');
    card.innerHTML = `
      <div class="lab-card-name">${lab.name}</div>
      <div class="lab-card-tutor">${lab.tutor}</div>
      <div class="lab-card-bar">
        <div class="lab-bar-inner" style="width:${pct}%"></div>
      </div>
      <div class="lab-card-count">${lab.occupied} / ${lab.capacity}${full ? ' · SATURO' : ''}</div>
    `;
    grid.appendChild(card);
  });
}

function startSession() {
  const available = stateGetAvailableLabs();

  if (available.length === 0) {
    showScreen('screen-done');
    return;
  }

  if (available.length === 1) {
    _assignedLab = available[0];
    _assignedViaChiamata = true;
    _showChiamataArmi(_assignedLab);
    return;
  }

  _assignedViaChiamata = false;
  _currentQuestions = selectQuestions(available);
  _currentAnswers = [];
  _currentQuestionIndex = 0;
  _showQuestion(0);
}

function _showQuestion(index) {
  const q = _currentQuestions[index];
  document.getElementById('step-indicator').textContent = `Domanda ${index + 1} di ${_currentQuestions.length}`;
  document.getElementById('question-text').textContent = q.testo;
  document.getElementById('label-left').textContent = q.labelLeft;
  document.getElementById('label-right').textContent = q.labelRight;

  const slider = document.getElementById('main-slider');
  slider.value = 5;
  updateSliderVisual(slider);

  showScreen('screen-question');
}

function confirmAnswer() {
  const slider = document.getElementById('main-slider');
  _currentAnswers.push(parseInt(slider.value, 10));

  if (_currentAnswers.length < _currentQuestions.length) {
    _currentQuestionIndex++;
    _showQuestion(_currentQuestionIndex);
  } else {
    _startProcessing();
  }
}

function updateSliderVisual(slider) {
  const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(to right, #00aaff ${pct}%, #1a1a2e ${pct}%)`;
}

function _startProcessing() {
  // Compute before animation so result is ready
  const available = stateGetAvailableLabs();
  _assignedLab = computeAssignment(_currentQuestions, _currentAnswers, available);

  showScreen('screen-processing');

  // Reset and restart scan ring animation
  const ring = document.getElementById('scan-ring');
  ring.style.animation = 'none';
  void ring.offsetHeight;
  ring.style.animation = 'fillRing 3s linear forwards';

  // Reset progress bar
  const bar = document.getElementById('progress-bar');
  bar.style.transition = 'none';
  bar.style.width = '0%';
  void bar.offsetHeight;
  bar.style.transition = 'width 3s linear';
  bar.style.width = '100%';

  // Terminal lines
  const terminal = document.getElementById('terminal-lines');
  terminal.innerHTML = '';
  let lineIdx = 0;
  const interval = 3000 / TERMINAL_LINES.length;
  _terminalInterval = setInterval(() => {
    if (lineIdx < TERMINAL_LINES.length) {
      const line = document.createElement('div');
      line.className = 'terminal-line';
      line.textContent = TERMINAL_LINES[lineIdx];
      terminal.appendChild(line);
      terminal.scrollTop = terminal.scrollHeight;
      lineIdx++;
    } else {
      clearInterval(_terminalInterval);
    }
  }, interval);

  _processingTimer = setTimeout(() => {
    clearInterval(_terminalInterval);
    _showVerdict(_assignedLab);
  }, 3000);
}

function _showVerdict(lab) {
  document.getElementById('verdict-lab-name').textContent = lab.name;
  document.getElementById('verdict-tutor').textContent = lab.tutor;
  document.getElementById('verdict-room').textContent = lab.room;

  showScreen('screen-verdict');
  playFanfare();

  // Restart reveal animation
  const labEl = document.getElementById('verdict-lab-name');
  labEl.classList.remove('animate-in');
  void labEl.offsetHeight;
  labEl.classList.add('animate-in');

  const detailsEl = document.getElementById('verdict-details');
  detailsEl.classList.remove('animate-in');
  void detailsEl.offsetHeight;
  detailsEl.classList.add('animate-in');
}

function _showChiamataArmi(lab) {
  document.getElementById('chiamata-lab-name').textContent = lab.name;
  document.getElementById('chiamata-tutor').textContent = lab.tutor;
  document.getElementById('chiamata-room').textContent = lab.room;
  showScreen('screen-chiamata');
  playFanfare();
}

function finishSession() {
  if (_assignedLab) {
    stateAssignToLab(_assignedLab.id);
  }
  _assignedLab = null;
  _assignedViaChiamata = false;
  renderStandby();
  showScreen('screen-standby');
}

function onLogoClick() {
  _logoClickCount++;
  if (_logoClickTimer) clearTimeout(_logoClickTimer);
  _logoClickTimer = setTimeout(() => { _logoClickCount = 0; }, 2000);
  if (_logoClickCount >= 5) {
    _logoClickCount = 0;
    toggleAdmin();
  }
}
