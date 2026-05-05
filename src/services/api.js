const BRAPI_BASE = 'https://brapi.dev/api';

/**
 * Fetch stock quote from brapi.dev
 * @param {string} ticker - Stock ticker (e.g. PETR4)
 * @returns {Promise<Object>} Stock data
 */
export async function getStockQuote(ticker) {
  const res = await fetch(`${BRAPI_BASE}/quote/${ticker.toUpperCase()}?fundamental=true`);
  if (!res.ok) throw new Error(`Erro ao buscar ${ticker}`);
  const data = await res.json();
  if (!data.results || !data.results.length) throw new Error(`Ticker ${ticker} não encontrado`);
  return data.results[0];
}

/**
 * Fetch multiple stock quotes
 * @param {string[]} tickers
 * @returns {Promise<Object[]>}
 */
export async function getMultipleQuotes(tickers) {
  const joined = tickers.join(',');
  const res = await fetch(`${BRAPI_BASE}/quote/${joined}`);
  if (!res.ok) throw new Error('Erro ao buscar cotações');
  const data = await res.json();
  return data.results || [];
}

/**
 * Fetch stock price history
 * @param {string} ticker
 * @param {string} range - 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y
 * @param {string} interval - 1d, 1wk, 1mo
 * @returns {Promise<Object>}
 */
export async function getStockHistory(ticker, range = '1mo', interval = '1d') {
  const res = await fetch(`${BRAPI_BASE}/quote/${ticker.toUpperCase()}?range=${range}&interval=${interval}`);
  if (!res.ok) throw new Error(`Erro ao buscar histórico de ${ticker}`);
  const data = await res.json();
  if (!data.results || !data.results.length) throw new Error(`Sem dados para ${ticker}`);
  return data.results[0];
}

/**
 * Search for available tickers
 * @param {string} query
 * @returns {Promise<Object[]>}
 */
export async function searchTickers(query) {
  const res = await fetch(`${BRAPI_BASE}/available?search=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Erro na busca');
  const data = await res.json();
  return (data.stocks || []).slice(0, 10);
}
