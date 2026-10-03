import { formatMoney } from '@shared/utils/formatMoney.js';
import { PERIODS } from '@features/setup/income/incomeRules.js';
import { INCOME_SETTINGS } from './settingsIncomeContent.js';

const DAY = /^(\d{4})-(\d{2})-(\d{2})/; // "2026-10-01"

const toDate = (day) => {
  const match = DAY.exec(day ?? '');
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
};

const format = (date, locale) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

// "2026-10-01" reads "1 Oct 2026". Empty when the date is missing. locale is for tests.
export const incomeDate = (day, locale) => {
  const date = toDate(day);
  return date ? format(date, locale) : '';
};

// effectiveTo is exclusive, so the last day an income applied is the day before it.
export const incomeLastDay = (effectiveTo, locale) => {
  const date = toDate(effectiveTo);
  if (!date) return '';
  date.setDate(date.getDate() - 1);
  return format(date, locale);
};

// MONTHLY -> "Monthly"; CUSTOM with 14 days -> "Every 14 days".
export function periodWords(income) {
  if (income.periodType === 'CUSTOM') return INCOME_SETTINGS.custom(income.periodLength);
  return PERIODS.find((period) => period.value === income.periodType)?.label ?? '';
}

// "₦100,000 to ₦150,000"; one amount when the two are the same.
export function rangeWords(income) {
  const low = formatMoney(income.minAmount);
  const high = formatMoney(income.maxAmount);
  return Number(income.minAmount) === Number(income.maxAmount) ? low : INCOME_SETTINGS.range(low, high);
}
