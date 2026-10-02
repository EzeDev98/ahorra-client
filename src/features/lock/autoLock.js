// When the app locks (Step 8d). Nothing here shows a screen: it only calls lockState.lock(), and UnlockGuard
// (which reacts live) moves the person to Unlock, which replaces Home entirely, so pending entries are never on screen.
//
// The app locks, but only for a signed-in person who has a PIN, when:
//   - it opens from nothing (a cold start), before the first render, so launch already sees it locked;
//   - it goes to the background (another app, another tab, screen off), by default at once;
//   - it sits untouched while open for IDLE_LOCK_MS.
// A fresh sign-in does not ask for the PIN straight away. Signing out unlocks, so the next sign-in starts clean.
import { sessionManager } from '@features/auth/session/sessionManager.js';
import { lockState } from './lockState.js';
import { pinStore } from './pinStore.js';

// AGREED (owner, 1 Oct 2026). Change a number here and nothing else.
export const AWAY_LOCK_MS = 0; // 0: lock the moment the app leaves the foreground. Above 0: lock on return if away this long.
export const IDLE_LOCK_MS = 5 * 60_000; // no tap, key press, scroll or touch for this long locks the open app

// What counts as being in use. Moving the mouse alone does not.
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'];

const lockIfOn = () => {
  if (sessionManager.hasSession() && pinStore.has()) lockState.lock();
};

let started = false;

// Call once, before the first render (main.jsx).
export function startAutoLock() {
  if (started) return;
  started = true;

  lockIfOn(); // cold start

  // Signing out, or a session that ended, leaves nothing to lock. Without this the next person to sign in would meet Unlock.
  sessionManager.subscribe(() => {
    if (!sessionManager.hasSession()) lockState.unlock();
  });

  let leftAt = null;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      leftAt = Date.now();
      if (AWAY_LOCK_MS === 0) lockIfOn();
      return;
    }
    const away = leftAt === null ? 0 : Date.now() - leftAt;
    leftAt = null;
    if (away >= AWAY_LOCK_MS) lockIfOn();
  });

  let idleTimer = null;
  const restartIdleTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(lockIfOn, IDLE_LOCK_MS);
  };
  ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, restartIdleTimer, { capture: true, passive: true }));
  restartIdleTimer();
}
