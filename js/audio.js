function playFanfare() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Triumphant C major arpeggio ending on a chord
    const notes = [
      { freq: 523.25, time: 0,    dur: 0.35 },  // C5
      { freq: 659.25, time: 0.18, dur: 0.35 },  // E5
      { freq: 783.99, time: 0.36, dur: 0.35 },  // G5
      { freq: 1046.5, time: 0.55, dur: 0.7  },  // C6 (chord root)
      { freq: 783.99, time: 0.55, dur: 0.7  },  // G5 (chord 5th)
      { freq: 659.25, time: 0.55, dur: 0.7  },  // E5 (chord 3rd)
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + time;

      osc.type = 'triangle';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
      gain.gain.setValueAtTime(0.18, t + dur - 0.06);
      gain.gain.linearRampToValueAtTime(0, t + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    });
  } catch (e) {
    // Audio not available — silent fallback
  }
}
