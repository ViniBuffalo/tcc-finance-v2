import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js';
import { getStockQuote, getStockHistory, getMultipleQuotes, searchTickers } from '../services/api.js';
import { formatCurrency } from '../utils/formatters.js';
import { POPULAR_TICKERS } from '../utils/constants.js';
import { showToast } from '../components/Toast.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);
let chartInstance = null;
let watchlist = [];
let selectedTicker = null;

export function renderStocks() {
  const el = document.getElementById('page-content');
  el.innerHTML = `
    <div class="fade-in">
      <div style="margin-bottom:var(--space-xl);">
        <h2 style="font-size:var(--fs-2xl);font-weight:var(--fw-bold);">Mercado de Ações</h2>
        <p style="color:var(--text-secondary);font-size:var(--fs-sm);margin-top:var(--space-xxs);">Acompanhe cotações em tempo real via B3</p>
      </div>

      <!-- Search -->
      <div class="stock-search">
        <input type="text" class="form-input" id="stock-search-input" placeholder="Buscar ticker (ex: PETR4, VALE3)" />
        <button class="btn btn-primary" id="stock-search-btn">
          <i data-lucide="search" style="width:18px;height:18px;"></i>
          Buscar
        </button>
      </div>

      <!-- Popular Tags -->
      <div style="display:flex;flex-wrap:wrap;gap:var(--space-xs);margin-bottom:var(--space-lg);">
        <span style="font-size:var(--fs-xs);color:var(--text-muted);align-self:center;margin-right:var(--space-xs);">Populares:</span>
        ${POPULAR_TICKERS.slice(0, 8).map(t => `<button class="btn btn-secondary btn-sm quick-ticker" data-ticker="${t}">${t}</button>`).join('')}
      </div>

      <!-- Content Area -->
      <div id="stocks-content">
        <div class="card">
          <div class="empty-state">
            <i data-lucide="candlestick-chart"></i>
            <p>Busque um ticker para ver a cotação e o histórico de preços</p>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Search handler
  const searchInput = document.getElementById('stock-search-input');
  document.getElementById('stock-search-btn').addEventListener('click', () => doSearch(searchInput.value));
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(searchInput.value); });

  // Quick ticker buttons
  el.querySelectorAll('.quick-ticker').forEach(btn => {
    btn.addEventListener('click', () => {
      searchInput.value = btn.dataset.ticker;
      doSearch(btn.dataset.ticker);
    });
  });
}

async function doSearch(query) {
  query = query.trim().toUpperCase();
  if (!query) return;

  const content = document.getElementById('stocks-content');
  content.innerHTML = `<div class="card" style="display:flex;justify-content:center;padding:var(--space-3xl);"><div class="loader-lg loader"></div></div>`;

  try {
    const stock = await getStockQuote(query);
    const historyData = await getStockHistory(query, '6mo', '1d');
    selectedTicker = query;
    renderStockDetail(content, stock, historyData);
  } catch (err) {
    content.innerHTML = `
      <div class="card">
        <div class="empty-state">
          <i data-lucide="alert-circle"></i>
          <p style="color:var(--danger);">${err.message}</p>
          <p style="margin-top:var(--space-sm);">Verifique o ticker e tente novamente</p>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }
}

function renderStockDetail(container, stock, historyData) {
  const change = stock.regularMarketChangePercent || 0;
  const isUp = change >= 0;
  const history = historyData.historicalDataPrice || [];

  container.innerHTML = `
    <div class="stock-detail fade-in">
      <!-- Left: Info -->
      <div>
        <div class="card" style="margin-bottom:var(--space-lg);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-md);">
            <div>
              <h3 style="font-size:var(--fs-2xl);font-weight:var(--fw-bold);">${stock.symbol}</h3>
              <p style="color:var(--text-secondary);font-size:var(--fs-sm);">${stock.longName || stock.shortName || ''}</p>
            </div>
            <span class="badge ${isUp ? 'badge-success' : 'badge-danger'}">
              ${isUp ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%
            </span>
          </div>
          <div class="stock-price">
            <span class="stock-price-value">${formatCurrency(stock.regularMarketPrice || 0)}</span>
            <span class="stock-change ${isUp ? 'up' : 'down'}">${isUp ? '+' : ''}${(stock.regularMarketChange || 0).toFixed(2)}</span>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3 class="card-title">Informações</h3></div>
          <div class="stock-info-grid">
            <div class="stock-info-item"><div class="stock-info-label">Abertura</div><div class="stock-info-value">${formatCurrency(stock.regularMarketOpen || 0)}</div></div>
            <div class="stock-info-item"><div class="stock-info-label">Máxima do dia</div><div class="stock-info-value">${formatCurrency(stock.regularMarketDayHigh || 0)}</div></div>
            <div class="stock-info-item"><div class="stock-info-label">Mínima do dia</div><div class="stock-info-value">${formatCurrency(stock.regularMarketDayLow || 0)}</div></div>
            <div class="stock-info-item"><div class="stock-info-label">Volume</div><div class="stock-info-value">${((stock.regularMarketVolume || 0) / 1_000_000).toFixed(1)}M</div></div>
            <div class="stock-info-item"><div class="stock-info-label">Máx 52 sem</div><div class="stock-info-value">${formatCurrency(stock.fiftyTwoWeekHigh || 0)}</div></div>
            <div class="stock-info-item"><div class="stock-info-label">Mín 52 sem</div><div class="stock-info-value">${formatCurrency(stock.fiftyTwoWeekLow || 0)}</div></div>
          </div>
        </div>
      </div>

      <!-- Right: Chart -->
      <div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Histórico de Preços</h3>
            <div class="tabs" id="range-tabs">
              <button class="tab" data-range="1mo" data-interval="1d">1M</button>
              <button class="tab" data-range="3mo" data-interval="1d">3M</button>
              <button class="tab active" data-range="6mo" data-interval="1d">6M</button>
              <button class="tab" data-range="1y" data-interval="1wk">1A</button>
              <button class="tab" data-range="5y" data-interval="1mo">5A</button>
            </div>
          </div>
          <div class="chart-container" style="height:320px;">
            <canvas id="stock-chart"></canvas>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
  renderPriceChart(history, isUp);

  // Range tab handlers
  document.querySelectorAll('#range-tabs .tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      document.querySelectorAll('#range-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      try {
        const data = await getStockHistory(selectedTicker, tab.dataset.range, tab.dataset.interval);
        const h = data.historicalDataPrice || [];
        const c = (data.regularMarketChangePercent || change) >= 0;
        renderPriceChart(h, c);
      } catch (err) {
        showToast('Erro ao carregar histórico', 'error');
      }
    });
  });
}

function renderPriceChart(history, isUp) {
  const canvas = document.getElementById('stock-chart');
  if (!canvas || !history.length) return;
  if (chartInstance) chartInstance.destroy();

  const color = isUp ? '#34d399' : '#f87171';
  const bgColor = isUp ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)';

  chartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: history.map(h => {
        const d = new Date(h.date * 1000);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      }),
      datasets: [{
        data: history.map(h => h.close),
        borderColor: color,
        backgroundColor: bgColor,
        fill: true,
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', font: { family: 'Inter', size: 10 }, maxTicksLimit: 10 }
        },
        y: {
          grid: { color: 'rgba(99,102,241,0.06)' },
          ticks: { color: '#64748b', font: { family: 'Inter', size: 11 }, callback: v => `R$${v.toFixed(2)}` }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a2138',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(99,102,241,0.3)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          callbacks: { label: ctx => ` Preço: ${formatCurrency(ctx.raw)}` }
        }
      }
    }
  });
}
