import { IR_TABLE } from '../utils/constants.js';

/**
 * Calculate compound interest with monthly contributions
 * @param {number} principal - Valor inicial
 * @param {number} monthlyContribution - Aporte mensal
 * @param {number} annualRate - Taxa anual (ex: 12 para 12%)
 * @param {number} months - Prazo em meses
 * @returns {{ totalAmount, totalInvested, totalInterest, monthlyData }}
 */
export function calculateCompoundInterest(principal, monthlyContribution, annualRate, months) {
  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  let balance = principal;
  let totalInvested = principal;
  const monthlyData = [{ month: 0, balance: principal, invested: principal, interest: 0 }];

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    totalInvested += monthlyContribution;
    monthlyData.push({
      month: m,
      balance: Math.round(balance * 100) / 100,
      invested: Math.round(totalInvested * 100) / 100,
      interest: Math.round((balance - totalInvested) * 100) / 100,
    });
  }

  return {
    totalAmount: Math.round(balance * 100) / 100,
    totalInvested: Math.round(totalInvested * 100) / 100,
    totalInterest: Math.round((balance - totalInvested) * 100) / 100,
    monthlyData,
  };
}

/**
 * Calculate IR (income tax) based on investment period
 * @param {number} profit - Rendimento bruto
 * @param {number} days - Dias do investimento
 * @param {boolean} isExempt - Se é isento (LCI/LCA)
 * @returns {{ tax, netProfit, rate }}
 */
export function calculateIR(profit, days, isExempt = false) {
  if (isExempt || profit <= 0) return { tax: 0, netProfit: profit, rate: 0 };
  const bracket = IR_TABLE.find(b => days <= b.maxDays);
  const rate = bracket ? bracket.rate : 0.15;
  const tax = Math.round(profit * rate * 100) / 100;
  return { tax, netProfit: Math.round((profit - tax) * 100) / 100, rate };
}

/**
 * Calculate diversification score (0-100)
 * @param {Array} assets - Array of { category, value }
 * @returns {number}
 */
export function calculateDiversificationScore(assets) {
  if (!assets.length) return 0;
  const total = assets.reduce((s, a) => s + a.value, 0);
  if (total === 0) return 0;

  // Group by category
  const categories = {};
  assets.forEach(a => {
    categories[a.category] = (categories[a.category] || 0) + a.value;
  });

  const catValues = Object.values(categories);
  const numCategories = catValues.length;

  // Herfindahl-Hirschman Index (inverted)
  const hhi = catValues.reduce((sum, v) => sum + Math.pow(v / total, 2), 0);
  const normalizedHHI = (1 - hhi) * 100;

  // Bonus for number of categories (max 6)
  const categoryBonus = Math.min(numCategories / 4, 1) * 20;

  return Math.min(Math.round(normalizedHHI + categoryBonus), 100);
}
