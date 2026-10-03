const DAY = /^(\d{4})-(\d{2})-(\d{2})/; // "2026-10-01"

const toDate = (day) => {
  const match = DAY.exec(day ?? '');
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
};

// "2026-10-01", "2026-10-31" reads "1 to 31 Oct" (the device's language and order). A one-day period reads as one date.
// Null when either date is missing. locale is for tests.
export function periodRange(start, end, locale) {
  const from = toDate(start);
  const to = toDate(end);
  if (!from || !to) return null;
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).formatRange(from, to);
}
