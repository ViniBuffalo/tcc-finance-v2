let toastId = 0;

/**
 * Show a toast notification
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration - ms
 */
export function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  const id = `toast-${++toastId}`;

  const iconMap = { success: 'check-circle', error: 'x-circle', warning: 'alert-triangle', info: 'info' };

  const toast = document.createElement('div');
  toast.id = id;
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i data-lucide="${iconMap[type]}" style="width:18px;height:18px;flex-shrink:0;color:var(--${type === 'error' ? 'danger' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'primary'})"></i>
    <span>${message}</span>
    <span class="toast-close" data-toast-close="${id}">✕</span>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  toast.querySelector('.toast-close').addEventListener('click', () => removeToast(id));

  setTimeout(() => removeToast(id), duration);
}

function removeToast(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.opacity = '0';
  el.style.transform = 'translateX(100%)';
  el.style.transition = 'all 300ms ease';
  setTimeout(() => el.remove(), 300);
}
