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
        <h1 class="header-title">${page?.label || 'Dashboard'}</h1>
      </div>
      <div class="header-right">
        <span style="font-size:var(--fs-sm);color:var(--text-secondary)">${greeting} — ${dateStr}</span>
      </div>
    </div>
  `;
}
