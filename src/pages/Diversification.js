import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { getAssets, saveAssets } from '../services/storage.js';
import { getSession } from '../services/auth.js';
import { formatCurrency, uid } from '../utils/formatters.js';
import { ASSET_CATEGORIES } from '../utils/constants.js';
import { calculateDiversificationScore } from '../services/calculations.js';
import { showToast } from '../components/Toast.js';
import { showModal } from '../components/Modal.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);
let chartInstance = null;

export function renderDiversification() {
  const session = getSession();
  const el = document.getElementById('page-content');
  draw(el, session);
}

function draw(el, session) {
  const assets = getAssets(session.id);
  const totalValue = assets.reduce((s, a) => s + a.value, 0);
  const score = calculateDiversificationScore(assets);
  const catTotals = {};
  assets.forEach(a => { catTotals[a.category] = (catTotals[a.category] || 0) + a.value; });

  // Score color
  const scoreColor = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';
  const circumference = 2 * Math.PI * 56;
  const dashOffset = circumference - (score / 100) * circumference;

  el.innerHTML = `
    <div class="fade-in">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-xl);flex-wrap:wrap;gap:var(--space-md);">
        <div>
          <h2 style="font-size:var(--fs-2xl);font-weight:var(--fw-bold);">Diversificação de Investimentos</h2>
          <p style="color:var(--text-secondary);font-size:var(--fs-sm);margin-top:var(--space-xxs);">Gerencie e equilibre sua carteira</p>
        </div>
        <button class="btn btn-primary" id="add-asset-btn">
          <i data-lucide="plus" style="width:18px;height:18px;"></i>
          Adicionar Ativo
        </button>
      </div>

      <div class="diversification-layout">
        <!-- Left: Score + Chart -->
        <div>
          <!-- Score -->
          <div class="card" style="margin-bottom:var(--space-lg);">
            <div style="display:flex;align-items:center;gap:var(--space-xl);flex-wrap:wrap;">
              <div class="score-ring-container">
                <div class="score-ring">
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    <circle class="score-ring-bg" cx="70" cy="70" r="56" />
                    <circle class="score-ring-fill" cx="70" cy="70" r="56"
                      stroke="${scoreColor}"
                      stroke-dasharray="${circumference}"
                      stroke-dashoffset="${dashOffset}" />
                  </svg>
                  <div class="score-ring-text">
                    <span class="score-ring-value" style="color:${scoreColor};">${score}</span>
                    <span class="score-ring-label">de 100</span>
                  </div>
                </div>
                <span style="font-size:var(--fs-sm);font-weight:var(--fw-semibold);">Score de Diversificação</span>
              </div>
              <div style="flex:1;min-width:200px;">
                <p style="color:var(--text-secondary);font-size:var(--fs-sm);line-height:1.7;">
                  ${score >= 70 ? '🎯 Excelente! Sua carteira está bem diversificada.' :
                    score >= 40 ? '⚠️ Razoável. Considere adicionar mais categorias.' :
                    '🔴 Baixa diversificação. Distribua seus ativos em mais categorias.'}
                </p>
                <div style="margin-top:var(--space-md);font-size:var(--fs-sm);color:var(--text-secondary);">
                  <strong style="color:var(--text-primary);">${formatCurrency(totalValue)}</strong> em ${assets.length} ativo${assets.length !== 1 ? 's' : ''}
                  · ${Object.keys(catTotals).length} categoria${Object.keys(catTotals).length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          <!-- Allocation Chart -->
          <div class="card">
            <div class="card-header"><h3 class="card-title">Alocação por Categoria</h3></div>
            ${assets.length > 0 ? `
              <div class="allocation-bar">
                ${Object.entries(catTotals).map(([catId, val]) => {
                  const cat = ASSET_CATEGORIES.find(c => c.id === catId);
                  const pct = totalValue > 0 ? (val / totalValue * 100) : 0;
                  return `<div class="allocation-segment" style="width:${pct}%;background:${cat?.color || '#6366f1'};" title="${cat?.label}: ${pct.toFixed(1)}%"></div>`;
                }).join('')}
              </div>
              <div class="allocation-legend">
                ${Object.entries(catTotals).map(([catId, val]) => {
                  const cat = ASSET_CATEGORIES.find(c => c.id === catId);
                  const pct = totalValue > 0 ? (val / totalValue * 100) : 0;
                  return `<div class="legend-item"><div class="legend-color" style="background:${cat?.color}"></div><span>${cat?.label}: ${pct.toFixed(1)}% (${formatCurrency(val)})</span></div>`;
                }).join('')}
              </div>
              <div style="height:220px;margin-top:var(--space-lg);display:flex;justify-content:center;">
                <canvas id="diversification-donut"></canvas>
              </div>
            ` : `
              <div class="empty-state">
                <i data-lucide="pie-chart"></i>
                <p>Adicione ativos para visualizar a alocação</p>
              </div>
            `}
          </div>
        </div>

        <!-- Right: Asset List -->
        <div>
          <div class="card">
            <div class="card-header"><h3 class="card-title">Seus Ativos</h3></div>
            ${assets.length > 0 ? `
              <div class="asset-list">
                ${assets.map(a => {
                  const cat = ASSET_CATEGORIES.find(c => c.id === a.category);
                  const pct = totalValue > 0 ? (a.value / totalValue * 100) : 0;
                  return `
                    <div class="asset-item">
                      <div class="asset-info">
                        <div class="asset-icon" style="background:${cat?.color}20;color:${cat?.color};">${a.name.slice(0,2).toUpperCase()}</div>
                        <div>
                          <div style="font-weight:var(--fw-semibold);font-size:var(--fs-sm);">${a.name}</div>
                          <div style="font-size:var(--fs-xs);color:var(--text-muted);">${cat?.label} · ${pct.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div style="display:flex;align-items:center;gap:var(--space-sm);">
                        <span style="font-weight:var(--fw-semibold);font-size:var(--fs-sm);">${formatCurrency(a.value)}</span>
                        <button class="btn btn-ghost btn-sm edit-asset-btn" data-id="${a.id}"><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>
                        <button class="btn btn-ghost btn-sm delete-asset-btn" data-id="${a.id}"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--danger);"></i></button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : `
              <div class="empty-state">
                <i data-lucide="layers"></i>
                <p>Nenhum ativo cadastrado. Clique em "Adicionar Ativo" para começar!</p>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
  renderDonut(assets, catTotals, totalValue);
  bindEvents(el, session);
}

function renderDonut(assets, catTotals, totalValue) {
  if (!assets.length) return;
  const canvas = document.getElementById('diversification-donut');
  if (!canvas) return;
  if (chartInstance) chartInstance.destroy();
  const labels = [], data = [], colors = [];
  Object.entries(catTotals).forEach(([catId, val]) => {
    const cat = ASSET_CATEGORIES.find(c => c.id === catId);
    labels.push(cat?.label || catId);
    data.push(val);
    colors.push(cat?.color || '#6366f1');
  });
  chartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: '#1a2138', borderWidth: 3 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '60%',
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#1a2138', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(99,102,241,0.3)', borderWidth: 1, padding: 12, cornerRadius: 8,
          callbacks: { label: ctx => ` ${ctx.label}: ${formatCurrency(ctx.raw)} (${(ctx.raw/totalValue*100).toFixed(1)}%)` }
        }
      }
    }
  });
}

function bindEvents(el, session) {
  // Add asset
  el.querySelector('#add-asset-btn').addEventListener('click', () => openAssetModal(session, el));

  // Edit
  el.querySelectorAll('.edit-asset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const assets = getAssets(session.id);
      const asset = assets.find(a => a.id === btn.dataset.id);
      if (asset) openAssetModal(session, el, asset);
    });
  });

  // Delete
  el.querySelectorAll('.delete-asset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      showModal({
        title: 'Remover Ativo',
        body: '<p style="color:var(--text-secondary)">Tem certeza que deseja remover este ativo da sua carteira?</p>',
        confirmText: 'Remover',
        confirmClass: 'btn-danger',
        onConfirm: () => {
          let assets = getAssets(session.id);
          assets = assets.filter(a => a.id !== id);
          saveAssets(session.id, assets);
          showToast('Ativo removido', 'success');
          draw(el, session);
        }
      });
    });
  });
}

function openAssetModal(session, el, existing = null) {
  const isEdit = !!existing;
  const catOptions = ASSET_CATEGORIES.map(c =>
    `<option value="${c.id}" ${existing?.category === c.id ? 'selected' : ''}>${c.label}</option>`
  ).join('');

  showModal({
    title: isEdit ? 'Editar Ativo' : 'Novo Ativo',
    body: `
      <div class="auth-form">
        <div class="form-group">
          <label class="form-label">Nome do ativo</label>
          <input type="text" class="form-input" id="modal-asset-name" value="${existing?.name || ''}" placeholder="Ex: Tesouro Selic 2029" required />
        </div>
        <div class="form-group">
          <label class="form-label">Categoria</label>
          <select class="form-select" id="modal-asset-cat">${catOptions}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Valor investido (R$)</label>
          <input type="number" class="form-input" id="modal-asset-value" value="${existing?.value || ''}" placeholder="10000" min="0" step="0.01" required />
        </div>
      </div>
    `,
    confirmText: isEdit ? 'Salvar' : 'Adicionar',
    onConfirm: () => {
      const name = document.getElementById('modal-asset-name').value.trim();
      const category = document.getElementById('modal-asset-cat').value;
      const value = parseFloat(document.getElementById('modal-asset-value').value) || 0;
      if (!name || value <= 0) { showToast('Preencha todos os campos corretamente.', 'error'); return; }

      let assets = getAssets(session.id);
      if (isEdit) {
        assets = assets.map(a => a.id === existing.id ? { ...a, name, category, value } : a);
      } else {
        assets.push({ id: uid(), name, category, value, createdAt: new Date().toISOString() });
      }
      saveAssets(session.id, assets);
      showToast(isEdit ? 'Ativo atualizado!' : 'Ativo adicionado!', 'success');
      draw(el, session);
    }
  });
}
