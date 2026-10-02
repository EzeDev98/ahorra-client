// 1500000.5 -> ₦1,500,000.5. Whole amounts show no decimals; kobo show when present, never rounded away.
const NAIRA = new Intl.NumberFormat('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const formatMoney = (amount) => `₦${NAIRA.format(Number(amount) || 0)}`;
