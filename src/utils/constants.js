/** Asset categories for diversification */
export const ASSET_CATEGORIES = [
  { id: 'renda_fixa', label: 'Renda Fixa', color: '#6366f1', icon: 'landmark' },
  { id: 'acoes', label: 'Ações', color: '#22d3ee', icon: 'trending-up' },
  { id: 'fiis', label: 'FIIs', color: '#34d399', icon: 'building-2' },
  { id: 'crypto', label: 'Criptomoedas', color: '#fbbf24', icon: 'bitcoin' },
  { id: 'internacional', label: 'Internacional', color: '#f87171', icon: 'globe' },
  { id: 'outros', label: 'Outros', color: '#a78bfa', icon: 'layers' },
];

/** IR regressivo (tabela de imposto de renda para renda fixa) */
export const IR_TABLE = [
  { maxDays: 180, rate: 0.225 },
  { maxDays: 360, rate: 0.20 },
  { maxDays: 720, rate: 0.175 },
  { maxDays: Infinity, rate: 0.15 },
];

/** Economic indicators (default/fallback values) */
export const DEFAULT_INDICATORS = {
  selic: 14.75,
  cdi: 14.65,
  ipca: 5.53,
};

/** Popular Brazilian stocks for quick search */
export const POPULAR_TICKERS = [
  'PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3',
  'WEGE3', 'RENT3', 'BBAS3', 'SUZB3', 'ELET3',
  'MGLU3', 'BPAC11', 'RADL3', 'JBSS3', 'HAPV3',
];

/** Navigation items */
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { id: 'calculator', label: 'Calculadora', icon: 'calculator' },
  { id: 'diversification', label: 'Diversificação', icon: 'pie-chart' },
  { id: 'stocks', label: 'Mercado', icon: 'candlestick-chart' },
];
