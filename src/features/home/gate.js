import { GATE_COPY } from './gateContent.js';

// What Home says about the day gate (Guide 7.7), as plain functions of what GET /day/status returned.
// Nothing here knows about the screen. The server decides whether the day is gated; this only words it.

const TIME = /^(\d{1,2}):(\d{2})/; // "22:00" or "22:00:00"
const DAY = /^(\d{4})-(\d{2})-(\d{2})/; // "2026-10-01"
const MS_PER_DAY = 86_400_000;
const RECHECK_DELAY_MS = 2000; // a moment past the gate time, so the server's own clock has crossed it too

// "22:00" reads "10 pm", "07:30" reads "7:30 am". Always a 12-hour clock, the way people say the time out loud.
// locale is for tests; the device's language is used otherwise.
export function friendlyTime(hardGateTime, locale) {
  const match = TIME.exec(hardGateTime ?? '');
  if (!match) return null;
  const at = new Date(2000, 0, 1, Number(match[1]), Number(match[2]));
  const parts = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', hour12: true }).formatToParts(at);
  const part = (type) => parts.find((item) => item.type === type)?.value;
  if (match[2] === '00' && part('dayPeriod')) return `${part('hour')} ${part('dayPeriod')}`;
  return parts.map((item) => item.value).join('');
}

// "2026-09-30" reads "yesterday" the next day, a weekday name for the rest of that week, and a date after that
// ("28 September", with the year only when it is not this year). Dates are read as the device's own calendar days.
export function friendlyDay(day, now = new Date(), locale) {
  const match = DAY.exec(day ?? '');
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysAgo = Math.round((today - date) / MS_PER_DAY);

  if (daysAgo === 1) return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-1, 'day');
  if (daysAgo >= 2 && daysAgo <= 6) return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
  const year = date.getFullYear() === today.getFullYear() ? {} : { year: 'numeric' };
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', ...year }).format(date);
}

// The words for the gate note, or null when the day is not gated.
export function gateNote(status, now = new Date(), locale) {
  if (!status?.gated) return null;
  if (status.reason === 'HARD_GATE_TODAY') return GATE_COPY.hardGate(friendlyTime(status.hardGateTime, locale));
  if (status.reason === 'SUSPENDED_DAY') {
    return GATE_COPY.suspendedDay(friendlyDay(status.day, now, locale) ?? 'an earlier day', status.otherDaysRemaining ?? 0);
  }
  return GATE_COPY.generic;
}

// How long until the next time the server's hard gate starts (today's, or tomorrow's once today's has passed),
// or null when hardGateTime cannot be read. The device clock only decides when to ask again; the server decides.
export function msUntilGate(hardGateTime, now = new Date()) {
  const match = TIME.exec(hardGateTime ?? '');
  if (!match) return null;
  const at = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Number(match[1]), Number(match[2]));
  if (at <= now) at.setDate(at.getDate() + 1);
  return at - now + RECHECK_DELAY_MS;
}
