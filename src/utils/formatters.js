/** Format number as BRL currency */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

/** Format number as percentage */
export function formatPercent(value, decimals = 2) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/** Format number with thousand separators */
export function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

/** Format date to pt-BR locale */
export function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

/** Format date to short month/year */
export function formatMonthYear(date) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date(date));
}

/** Get user initials from name */
export function getInitials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

/** Parse BRL currency input to number */
export function parseCurrencyInput(str) {
  return parseFloat(str.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
}

/** Generate unique ID */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
