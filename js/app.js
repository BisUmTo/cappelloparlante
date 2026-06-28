document.addEventListener('DOMContentLoaded', () => {
  // Admin via URL param
  if (new URLSearchParams(window.location.search).get('admin') === '1') {
    setTimeout(toggleAdmin, 100);
  }

  // Wire buttons
  document.getElementById('btn-start').addEventListener('click', startSession);
  document.getElementById('btn-confirm').addEventListener('click', confirmAnswer);
  document.getElementById('btn-next').addEventListener('click', finishSession);
  document.getElementById('btn-chiamata-next').addEventListener('click', finishSession);
  document.getElementById('logo-area').addEventListener('click', onLogoClick);

  // Slider live update
  const slider = document.getElementById('main-slider');
  slider.addEventListener('input', () => updateSliderVisual(slider));

  // Escape ×3 within 2s → admin panel
  let escCount = 0;
  let escTimer = null;
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      escCount++;
      if (escTimer) clearTimeout(escTimer);
      escTimer = setTimeout(() => { escCount = 0; }, 2000);
      if (escCount >= 3) {
        escCount = 0;
        toggleAdmin();
      }
    }
  });

  // Labs collapsible toggle
  document.getElementById('btn-labs-toggle').addEventListener('click', () => {
    const col = document.getElementById('labs-collapsible');
    const label = document.getElementById('labs-toggle-label');
    const open = col.classList.toggle('open');
    label.textContent = open ? 'Nascondi posti disponibili' : 'Mostra posti disponibili';
  });

  initAdmin();
  renderStandby();
  showScreen('screen-standby');
});
