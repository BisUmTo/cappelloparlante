const STATE_KEY = 'cappello_state_v1';

function _defaultState() {
  const occupancy = {};
  LABS_CONFIG.forEach(lab => { occupancy[lab.id] = 0; });
  return { version: 1, occupancy };
}

function _loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.occupancy) return parsed;
    }
  } catch (_) {}
  return _defaultState();
}

function _saveState(s) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(s));
  } catch (_) {}
}

let _state = _loadState();

function stateGetLabs() {
  return LABS_CONFIG.map(lab => ({
    ...lab,
    occupied: _state.occupancy[lab.id] ?? 0,
  }));
}

function stateGetAvailableLabs() {
  return stateGetLabs().filter(l => l.occupied < l.capacity);
}

function stateAssignToLab(labId) {
  _state.occupancy[labId] = (_state.occupancy[labId] ?? 0) + 1;
  _saveState(_state);
}

function stateAdjust(labId, delta) {
  const lab = LABS_CONFIG.find(l => l.id === labId);
  if (!lab) return;
  const current = _state.occupancy[labId] ?? 0;
  _state.occupancy[labId] = Math.max(0, Math.min(lab.capacity, current + delta));
  _saveState(_state);
}

function stateReset() {
  _state = _defaultState();
  _saveState(_state);
}
