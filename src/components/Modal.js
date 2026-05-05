/**
 * Show a modal dialog
 * @param {Object} opts
 * @param {string} opts.title
 * @param {string} opts.body - HTML content
 * @param {Function} [opts.onConfirm]
 * @param {string} [opts.confirmText]
 * @param {string} [opts.confirmClass]
 */
export function showModal({ title, body, onConfirm, confirmText = 'Confirmar', confirmClass = 'btn-primary' }) {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <div class="modal" id="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">${title}</h2>
        <button class="btn btn-ghost btn-icon" id="modal-close-btn"><i data-lucide="x" style="width:20px;height:20px;"></i></button>
      </div>
      <div class="modal-body">${body}</div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-cancel-btn">Cancelar</button>
        ${onConfirm ? `<button class="btn ${confirmClass}" id="modal-confirm-btn">${confirmText}</button>` : ''}
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const close = () => { overlay.classList.add('hidden'); overlay.innerHTML = ''; };
  overlay.querySelector('#modal-close-btn').addEventListener('click', close);
  overlay.querySelector('#modal-cancel-btn').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  if (onConfirm) {
    overlay.querySelector('#modal-confirm-btn').addEventListener('click', () => {
      onConfirm();
      close();
    });
  }

  return { close, getElement: () => document.getElementById('modal-content') };
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('hidden');
  overlay.innerHTML = '';
}
