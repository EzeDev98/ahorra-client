import { formatMoney } from '@shared/utils/formatMoney.js';
import { VARIANCE_WORDS } from './reportDetailContent.js';

const PERCENT = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 1 });

// 45.5 -> "45.5%", 40 -> "40%".
export const formatPercent = (value) => `${PERCENT.format(Number(value) || 0)}%`;

// Positive variance is over the baseline, negative is under it (the server's definition).
// 1200 -> "₦1,200 over", -500 -> "₦500 under", 0 -> "On baseline".
export function varianceWords(variance) {
  const amount = Number(variance) || 0;
  if (amount > 0) return VARIANCE_WORDS.over(formatMoney(amount));
  if (amount < 0) return VARIANCE_WORDS.under(formatMoney(-amount));
  return VARIANCE_WORDS.on;
}
