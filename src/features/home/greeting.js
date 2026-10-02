// The greeting above the input (Guide 7.3). Fixed rules on the device clock, never AI, so it never flickers.
// It only greets: it never mentions the verdict and never praises or warns about spending.

const FALLBACK_NAME = 'there';

// month is 0 to 11, as in Date.getMonth(). Easter and Eid are left out: their dates move every year.
const OCCASIONS = [
  { month: 0, day: 1, words: 'Happy New Year' },
  { month: 11, day: 25, words: 'Merry Christmas' },
  { month: 9, day: 1, words: 'Happy Independence Day' }, // Nigeria, 1 October
];

function titleFor(hour, name) {
  if (hour < 5) return `Still up, ${name}?`;
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

// First match wins: occasion, observation mode, day of the week, season, otherwise empty.
function subtitleFor({ now, mode, daysObserved }) {
  const month = now.getMonth();
  const weekday = now.getDay(); // 0 is Sunday

  const occasion = OCCASIONS.find((item) => item.month === month && item.day === now.getDate());
  if (occasion) return occasion.words;
  if (mode === 'OBSERVATION') return `Day ${daysObserved + 1} of getting to know your spending`;
  if (weekday === 1) return 'A fresh week';
  if (weekday === 5) return 'Happy Friday';
  if (weekday === 0 || weekday === 6) return 'Enjoy your weekend';
  if (month === 11 || month <= 1) return 'Harmattan season. Stay hydrated.';
  if (month >= 5 && month <= 8) return 'Rainy season. Stay dry out there.';
  return '';
}

// name: the first name (blank or missing reads "there"). now: a Date, the device clock.
// mode and daysObserved: from GET /behavior/overview ('OBSERVATION' | 'JUDGMENT', and the number of closed days).
export function greeting({ name, now = new Date(), mode, daysObserved = 0 }) {
  return {
    title: titleFor(now.getHours(), name?.trim() || FALLBACK_NAME),
    subtitle: subtitleFor({ now, mode, daysObserved }),
  };
}
