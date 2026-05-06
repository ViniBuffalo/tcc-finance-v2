import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { getAssets } from '../services/storage.js';
import { getSession } from '../services/auth.js';
import { formatCurrency, formatPercent } from '../utils/formatters.js';
import { ASSET_CATEGORIES, DEFAULT_INDICATORS } from '../utils/constants.js';
import { calculateDiversificationScore } from '../services/calculations.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

let chartInstance = null;

export async function renderDashboard() {
  const session = getSession();
  const el = document.getElementById('page-content');
  const assets = await getAssets(session.id);
  const totalValue = assets.reduce((s, a) => s + a.value, 0);
  const score = calculateDiversificationScore(assets);
  const categoryTotals = {};
  assets.forEach(a => {
    categoryTotals[a.category] = (categoryTotals[a.category] || 0) + a.value;
  });

  const greeting = new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite';

  el.innerHTML = `
    <div class="fade-in">
      <div style="margin-bottom:var(--space-xl);">
        <h2 style="font-size:var(--fs-2xl);font-weight:var(--fw-bold);">${greeting}, ${session.name.split(' ')[0]}! 👋</h2>
        <p style="color:var(--text-secondary);font-size:var(--fs-sm);margin-top:var(--space-xxs);">Aqui está o resumo dos seus investimentos</p>
      </div>

      <!-- Stats Cards -->
      <div class="dashboard-stats">
        <div class="card-glass">
          <div class="stat-label">Patrimônio Total</div>
          <div class="stat-value" style="background:var(--accent-gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
            ${formatCurrency(totalValue)}
          </div>
          <div class="stat-change positive" style="margin-top:var(--space-xs);">
            <i data-lucide="wallet" style="width:14px;height:14px;"></i>
            ${assets.length} ativo${assets.length !== 1 ? 's' : ''} cadastrado${assets.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div class="card-glass">
          <div class="stat-label">Score de Diversificação</div>
          <div class="stat-value" style="color:${score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)'}">
            ${score}/100
          </div>
          <div class="stat-change" style="color:var(--text-secondary)">
            <i data-lucide="pie-chart" style="width:14px;height:14px;"></i>
            ${Object.keys(categoryTotals).length} categoria${Object.keys(categoryTotals).length !== 1 ? 's' : ''}
          </div>
        </div>
        <div class="card-glass">
          <div class="stat-label">Taxa Selic</div>
          <div class="stat-value">${DEFAULT_INDICATORS.selic}%</div>
          <div class="stat-change" style="color:var(--text-secondary)">
            <i data-lucide="landmark" style="width:14px;height:14px;"></i>
            ao ano
          </div>
        </div>
        <div class="card-glass">
          <div class="stat-label">CDI / IPCA</div>
          <div class="stat-value">${DEFAULT_INDICATORS.cdi}%</div>
          <div class="stat-change" style="color:var(--text-secondary)">
            <i data-lucide="trending-up" style="width:14px;height:14px;"></i>
            IPCA: ${DEFAULT_INDICATORS.ipca}%
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="dashboard-charts">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Alocação por Categoria</h3>
          </div>
          <div class="chart-container" style="display:flex;align-items:center;justify-content:center;">
            ${assets.length > 0 ? '<canvas id="dashboard-donut"></canvas>' : `
              <div class="empty-state">
                <i data-lucide="pie-chart"></i>
                <p>Adicione ativos na aba <strong>Diversificação</strong> para ver seu gráfico</p>
              </div>
            `}
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Seus Ativos</h3>
          </div>
          ${assets.length > 0 ? `
            <div class="asset-list" style="max-height:280px;overflow-y:auto;">
              ${assets.map(a => {
                const cat = ASSET_CATEGORIES.find(c => c.id === a.category);
                const pct = totalValue > 0 ? (a.value / totalValue * 100) : 0;
                return `
                  <div class="asset-item">
                    <div class="asset-info">
                      <div class="asset-icon" style="background:${cat?.color}20;color:${cat?.color};">${a.name.slice(0,2).toUpperCase()}</div>
                      <div>
                        <div style="font-weight:var(--fw-semibold);font-size:var(--fs-sm);">${a.name}</div>
                        <div style="font-size:var(--fs-xs);color:var(--text-muted);">${cat?.label || a.category}</div>
                      </div>
                    </div>
                    <div style="text-align:right;">
                      <div style="font-weight:var(--fw-semibold);font-size:var(--fs-sm);">${formatCurrency(a.value)}</div>
                      <div style="font-size:var(--fs-xs);color:var(--text-muted);">${pct.toFixed(1)}%</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="empty-state">
              <i data-lucide="layers"></i>
              <p>Nenhum ativo cadastrado ainda</p>
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Render donut chart
  if (assets.length > 0) {
    const canvas = document.getElementById('dashboard-donut');
    if (canvas) {
      if (chartInstance) chartInstance.destroy();
      const labels = [];
      const data = [];
      const colors = [];
      Object.entries(categoryTotals).forEach(([catId, val]) => {
        const cat = ASSET_CATEGORIES.find(c => c.id === catId);
        labels.push(cat?.label || catId);
        data.push(val);
        colors.push(cat?.color || '#6366f1');
      });
      chartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{ data, backgroundColor: colors, borderColor: '#121829', borderWidth: 3, hoverBorderWidth: 0 }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, usePointStyle: true, pointStyleWidth: 10, font: { family: 'Inter', size: 12 } } },
            tooltip: {
              backgroundColor: '#1a2138',
              titleColor: '#f1f5f9',
              bodyColor: '#94a3b8',
              borderColor: 'rgba(99,102,241,0.3)',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8,
              callbacks: { label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw)}` }
            }
          }
        }
      });
    }
  }
}
