function initAdmin() {
  document.getElementById('btn-admin-close').addEventListener('click', () => {
    document.getElementById('admin-overlay').classList.add('hidden');
  });

  document.getElementById('btn-reset-all').addEventListener('click', () => {
    if (confirm('Azzerare tutti i contatori? Questa operazione non può essere annullata.')) {
      stateReset();
      _renderAdminLabs();
      renderStandby();
    }
  });

  document.getElementById('btn-export').addEventListener('click', () => {
    const data = JSON.stringify(
      stateGetLabs().map(l => ({ id: l.id, name: l.name, occupied: l.occupied, capacity: l.capacity })),
      null, 2
    );
    if (navigator.clipboard) {
      navigator.clipboard.writeText(data).then(() => alert('Dati copiati negli appunti!'));
    } else {
      prompt('Copia questi dati:', data);
    }
  });
}

function _renderAdminLabs() {
  const labs = stateGetLabs();
  const container = document.getElementById('admin-labs-list');
  container.innerHTML = '';

  labs.forEach(lab => {
    const full = lab.occupied >= lab.capacity;
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <div class="admin-lab-info">
        <span class="admin-lab-name">${lab.name}</span>
        <span class="admin-lab-room">${lab.room}</span>
      </div>
      <div class="admin-controls">
        <button class="btn-adj btn-adj-minus" data-id="${lab.id}" data-delta="-1" ${lab.occupied <= 0 ? 'disabled' : ''}>−</button>
        <span class="admin-count ${full ? 'count-full' : ''}">${lab.occupied} / ${lab.capacity}</span>
        <button class="btn-adj btn-adj-plus" data-id="${lab.id}" data-delta="1" ${full ? 'disabled' : ''}>+</button>
      </div>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('.btn-adj').forEach(btn => {
    btn.addEventListener('click', () => {
      stateAdjust(btn.dataset.id, parseInt(btn.dataset.delta, 10));
      _renderAdminLabs();
      renderStandby();
    });
  });
}

function toggleAdmin() {
  const overlay = document.getElementById('admin-overlay');
  if (overlay.classList.contains('hidden')) {
    _renderAdminLabs();
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
  }
}
