// Keeps the access token fresh: asks for a new one shortly before the old one runs out, so a request never has to
// fail first. The 401 recovery in the HTTP client stays as the safety net (an unknown expiry, or a token the server
// refused early). Started once from main.jsx.
import { sessionManager } from './sessionManager.js';
import { REFRESH_LEAD_MS } from './tokenExpiry.js';

// After a failed attempt that did not end the session (offline, server trouble), try again after this long.
const RETRY_MS = 30_000;
// Never refresh more often than this. Protects against a device clock that is far ahead, where every new token
// would already look about to expire.
const MIN_GAP_MS = 60_000;
// setTimeout cannot hold more than about 24 days.
const LONGEST_WAIT_MS = 24 * 60 * 60 * 1000;

let timer = null;
let lastRenewedAt = 0;
let started = false;

function schedule() {
  clearTimeout(timer);
  timer = null;
  const expiresAt = sessionManager.getAccessExpiry();
  if (!sessionManager.hasSession() || !expiresAt) return;

  const now = Date.now();
  const wait = Math.max(0, expiresAt - REFRESH_LEAD_MS - now, lastRenewedAt + MIN_GAP_MS - now);
  timer = setTimeout(renew, Math.min(wait, LONGEST_WAIT_MS));
}

async function renew() {
  timer = null;
  const expiresAt = sessionManager.getAccessExpiry();
  if (!sessionManager.hasSession() || !expiresAt) return;

  // The wait was capped, or another tab refreshed meanwhile: not due yet.
  if (expiresAt - Date.now() > REFRESH_LEAD_MS) {
    schedule();
    return;
  }

  try {
    await sessionManager.refresh();
  } catch {
    // Offline or the server is having trouble: the session is kept, so try again shortly.
    timer = setTimeout(renew, RETRY_MS);
    return;
  }
  lastRenewedAt = Date.now();
  schedule();
}

export function startRefreshAhead() {
  if (started) return;
  started = true;

  // Signed in, signed out, or another tab changed the stored session.
  sessionManager.subscribe(schedule);
  // Timers stop while a phone sleeps or the app is in the background, so look again when the person comes back.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') schedule();
  });
  addEventListener('online', schedule);
  schedule();
}
