import { NAV_ITEMS } from '../utils/constants.js';
import { getSession, logout } from '../services/auth.js';
import { getInitials } from '../utils/formatters.js';

function closeMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
}

export function renderSidebar(currentRoute, onNavigate) {
  const session = getSession();
  const initials = session ? getInitials(session.name) : '?';

  const el = document.getElementById('sidebar');
  el.innerHTML = `
    <div class="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-logo">TC</div>
        <span class="sidebar-brand-text">TCC Company: Finance</span>
        <button class="btn btn-ghost btn-icon sidebar-close-btn" id="sidebar-close-btn" aria-label="Fechar menu">
          <i data-lucide="x" style="width:20px;height:20px;"></i>
        </button>
      </div>
      <nav class="sidebar-nav">
        <span class="sidebar-section-label">Menu Principal</span>
        ${NAV_ITEMS.map(item => `
          <div class="nav-item ${currentRoute === item.id ? 'active' : ''}" data-route="${item.id}">
            <i data-lucide="${item.icon}"></i>
            <span>${item.label}</span>
          </div>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user" id="sidebar-user-btn">
          <div class="sidebar-avatar">${initials}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${session?.name || 'Usuário'}</div>
            <div class="sidebar-user-email">${session?.email || ''}</div>
          </div>
          <i data-lucide="log-out" style="width:18px;height:18px;color:var(--text-muted);"></i>
        </div>
      </div>
    </div>
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
  `;

  // Nav click handlers — close sidebar on mobile after navigation
  el.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      closeMobileSidebar();
      onNavigate(item.dataset.route);
    });
  });

  // Close button (mobile)
  el.querySelector('#sidebar-close-btn').addEventListener('click', closeMobileSidebar);

  // Overlay click closes sidebar
  el.querySelector('#sidebar-overlay').addEventListener('click', closeMobileSidebar);

  // Logout handler
  el.querySelector('#sidebar-user-btn').addEventListener('click', () => {
    logout();
    window.location.hash = '';
    window.location.reload();
  });

  // Init Lucide icons
  if (window.lucide) window.lucide.createIcons();
}
