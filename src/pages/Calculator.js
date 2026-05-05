import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend } from 'chart.js';
import { calculateCompoundInterest, calculateIR } from '../services/calculations.js';
import { formatCurrency, formatNumber } from '../utils/formatters.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

let chartInstance = null;

export function renderCalculator() {
  const el = document.getElementById('page-content');
  el.innerHTML = `
    <div class="fade-in">
      <div style="margin-bottom:var(--space-xl);">
        <h2 style="font-size:var(--fs-2xl);font-weight:var(--fw-bold);">Calculadora de Juros Compostos</h2>
        <p style="color:var(--text-secondary);font-size:var(--fs-sm);margin-top:var(--space-xxs);">Simule o crescimento dos seus investimentos ao longo do tempo</p>
      </div>

      <div class="calc-layout">
        <!-- Input Panel -->
        <div>
          <div class="card" style="margin-bottom:var(--space-lg);">
            <div class="card-header"><h3 class="card-title"><i data-lucide="settings-2" style="width:18px;height:18px;display:inline;vertical-align:middle;margin-right:6px;"></i>Parâmetros</h3></div>
            <div class="auth-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Valor inicial (R$)</label>
                  <input type="number" class="form-input" id="calc-principal" value="10000" min="0" step="100" />
                </div>
                <div class="form-group">
                  <label class="form-label">Aporte mensal (R$)</label>
                  <input type="number" class="form-input" id="calc-monthly" value="500" min="0" step="50" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Taxa anual (%)</label>
                  <input type="number" class="form-input" id="calc-rate" value="12" min="0" step="0.1" />
                </div>
                <div class="form-group">
                  <label class="form-label">Prazo (meses)</label>
                  <input type="number" class="form-input" id="calc-months" value="120" min="1" max="600" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Tipo de investimento</label>
                  <select class="form-select" id="calc-type">
                    <option value="taxed">Com IR (CDB, Tesouro, etc.)</option>
                    <option value="exempt">Isento de IR (LCI/LCA)</option>
                  </select>
                </div>
              </div>
              <button class="btn btn-primary btn-lg" id="calc-btn" style="width:100%;margin-top:var(--space-xs);">
                <i data-lucide="calculator" style="width:18px;height:18px;"></i>
                Calcular
              </button>
            </div>
          </div>

          <!-- Quick Presets -->
          <div class="card">
            <div class="card-header"><h3 class="card-title">Cenários Rápidos</h3></div>
            <div style="display:flex;flex-wrap:wrap;gap:var(--space-xs);">
              <button class="btn btn-secondary btn-sm" data-preset='{"p":1000,"m":200,"r":13,"t":60}'>Conservador 5a</button>
              <button class="btn btn-secondary btn-sm" data-preset='{"p":5000,"m":500,"r":14,"t":120}'>Moderado 10a</button>
              <button class="btn btn-secondary btn-sm" data-preset='{"p":10000,"m":1000,"r":15,"t":240}'>Agressivo 20a</button>
              <button class="btn btn-secondary btn-sm" data-preset='{"p":0,"m":300,"r":13,"t":360}'>Do zero 30a</button>
            </div>
          </div>
        </div>

        <!-- Results Panel -->
        <div id="calc-results">
          <div class="card" style="margin-bottom:var(--space-lg);">
            <div class="calc-result-highlight">
              <div class="calc-result-label">Montante Final</div>
              <div class="calc-result-value" id="res-total">R$ 0,00</div>
              <div class="calc-result-label" id="res-net-label" style="margin-top:var(--space-xs);"></div>
            </div>
            <div class="calc-breakdown">
              <div style="text-align:center;">
                <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-bottom:var(--space-xxs);">Total Investido</div>
                <div style="font-size:var(--fs-lg);font-weight:var(--fw-bold);color:var(--accent);" id="res-invested">R$ 0,00</div>
              </div>
              <div style="text-align:center;">
                <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-bottom:var(--space-xxs);">Juros Ganhos</div>
                <div style="font-size:var(--fs-lg);font-weight:var(--fw-bold);color:var(--success);" id="res-interest">R$ 0,00</div>
              </div>
              <div style="text-align:center;">
                <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-bottom:var(--space-xxs);">IR Retido</div>
                <div style="font-size:var(--fs-lg);font-weight:var(--fw-bold);color:var(--danger);" id="res-tax">R$ 0,00</div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><h3 class="card-title">Evolução do Patrimônio</h3></div>
            <div class="chart-container" style="height:300px;">
              <canvas id="calc-chart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Calculate on load
  runCalculation();

  // Button handler
  document.getElementById('calc-btn').addEventListener('click', runCalculation);

  // Enter key triggers calculation
  el.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') runCalculation(); });
  });

  // Presets
  el.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = JSON.parse(btn.dataset.preset);
      document.getElementById('calc-principal').value = p.p;
      document.getElementById('calc-monthly').value = p.m;
      document.getElementById('calc-rate').value = p.r;
      document.getElementById('calc-months').value = p.t;
      runCalculation();
    });
  });
}

function runCalculation() {
  const principal = parseFloat(document.getElementById('calc-principal').value) || 0;
  const monthly = parseFloat(document.getElementById('calc-monthly').value) || 0;
  const rate = parseFloat(document.getElementById('calc-rate').value) || 0;
  const months = parseInt(document.getElementById('calc-months').value) || 1;
  const isExempt = document.getElementById('calc-type').value === 'exempt';

  const result = calculateCompoundInterest(principal, monthly, rate, months);
  const ir = calculateIR(result.totalInterest, months * 30, isExempt);

  document.getElementById('res-total').textContent = formatCurrency(result.totalAmount);
  document.getElementById('res-invested').textContent = formatCurrency(result.totalInvested);
  document.getElementById('res-interest').textContent = formatCurrency(result.totalInterest);
  document.getElementById('res-tax').textContent = formatCurrency(ir.tax);

  const netLabel = document.getElementById('res-net-label');
  if (ir.tax > 0) {
    netLabel.textContent = `Líquido após IR (${(ir.rate * 100).toFixed(1)}%): ${formatCurrency(result.totalAmount - ir.tax)}`;
  } else {
    netLabel.textContent = 'Isento de Imposto de Renda';
  }

  renderChart(result.monthlyData);
}

function renderChart(data) {
  const canvas = document.getElementById('calc-chart');
  if (!canvas) return;
  if (chartInstance) chartInstance.destroy();

  // Sample data points (max ~30 points for readability)
  const step = Math.max(1, Math.floor(data.length / 30));
  const sampled = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  chartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: sampled.map(d => d.month >= 12 ? `${Math.floor(d.month / 12)}a` : `${d.month}m`),
      datasets: [
        {
          label: 'Montante',
          data: sampled.map(d => d.balance),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 5,
          borderWidth: 2.5,
        },
        {
          label: 'Total Investido',
          data: sampled.map(d => d.invested),
          borderColor: '#22d3ee',
          backgroundColor: 'rgba(34,211,238,0.05)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 5,
          borderWidth: 2,
          borderDash: [6, 3],
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      scales: {
        x: { grid: { color: 'rgba(99,102,241,0.06)' }, ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } } },
        y: {
          grid: { color: 'rgba(99,102,241,0.06)' },
          ticks: {
            color: '#64748b',
            font: { family: 'Inter', size: 11 },
            callback: (v) => {
              if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`;
              if (v >= 1_000) return `R$${(v / 1_000).toFixed(0)}k`;
              return `R$${v}`;
            }
          }
        }
      },
      plugins: {
        legend: { labels: { color: '#94a3b8', usePointStyle: true, font: { family: 'Inter', size: 12 } } },
        tooltip: {
          backgroundColor: '#1a2138',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(99,102,241,0.3)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            title: (items) => `Mês ${sampled[items[0].dataIndex].month}`,
            label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
          }
        }
      }
    }
  });
}
