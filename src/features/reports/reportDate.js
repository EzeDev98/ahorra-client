const DAY = /^(\d{4})-(\d{2})-(\d{2})/; // "2026-10-01"

// "2026-09-29" reads "Mon, 29 Sep", with the year only when it is not this year. The date is read as the device's own
// calendar day. now and locale are for tests; the device's language is used otherwise.
export function reportDate(day, now = new Date(), locale) {
  const match = DAY.exec(day ?? '');
  if (!match) return day ?? '';
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const year = date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' };
  return new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', ...year }).format(date);
}

// "2026-09-29" reads "Monday 29 September", with the year only when it is not this year. For a screen title.
export function reportDateLong(day, now = new Date(), locale) {
  const match = DAY.exec(day ?? '');
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const year = date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' };
  return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', ...year }).format(date);
}
