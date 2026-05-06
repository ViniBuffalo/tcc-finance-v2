import { NAV_ITEMS } from '../utils/constants.js';

export function renderHeader(currentRoute) {
  const page = NAV_ITEMS.find(n => n.id === currentRoute);
  const el = document.getElementById('header');
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite';
  const dateStr = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);

  el.innerHTML = `
    <div class="header">
      <div class="header-left">
        <button class="btn btn-ghost btn-icon mobile-menu-btn" id="mobile-menu-btn" aria-label="Abrir menu">
          <i data-lucide="menu" style="width:22px;height:22px;"></i>
        </button>
        <h1 class="header-title">${page?.label || 'Dashboard'}</h1>
      </div>
      <div class="header-right">
        <span class="header-date" style="font-size:var(--fs-sm);color:var(--text-secondary)">${greeting} — ${dateStr}</span>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Mobile menu toggle
  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active');
    }
  });
}
