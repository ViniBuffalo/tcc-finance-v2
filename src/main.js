import './styles/index.css';
import { getSession } from './services/auth.js';
import { initRouter, navigate, getCurrentRoute } from './router.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderHeader } from './components/Header.js';
import { renderLogin } from './pages/Login.js';
import { renderDashboard } from './pages/Dashboard.js';
import { renderCalculator } from './pages/Calculator.js';
import { renderDiversification } from './pages/Diversification.js';
import { renderStocks } from './pages/Stocks.js';

const pageRenderers = {
  dashboard: renderDashboard,
  calculator: renderCalculator,
  diversification: renderDiversification,
  stocks: renderStocks,
};

function initApp() {
  const session = getSession();

  if (!session) {
    // Show login screen
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('app-shell').classList.add('hidden');
    renderLogin((sess) => {
      // On successful login/register
      document.getElementById('auth-screen').classList.add('hidden');
      document.getElementById('app-shell').classList.remove('hidden');
      startApp();
    });
  } else {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    startApp();
  }
}

function startApp() {
  initRouter((route) => {
    renderPage(route);
  });
}

async function renderPage(route) {
  const renderer = pageRenderers[route];
  if (!renderer) {
    navigate('dashboard');
    return;
  }

  // Update sidebar & header
  renderSidebar(route, (newRoute) => navigate(newRoute));
  renderHeader(route);

  // Render page content (pode ser async)
  await renderer();

  // Scroll to top
  document.querySelector('.page-content')?.scrollTo(0, 0);
}

// Boot
document.addEventListener('DOMContentLoaded', initApp);
