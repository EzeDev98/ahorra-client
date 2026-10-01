// Whether this person has finished first-run setup on this device. The server only knows about income; the rest of
// setup (fixed obligations, the lock offer) lives on this device, so "finished" is a flag kept here, per person, and
// signing out and in again does not repeat setup. The flag is only the word "true"; nothing personal is stored.
import { sessionManager } from '@features/auth/session/sessionManager.js';

const PREFIX = 'ahorra.setup.complete.';
const fallback = new Set(); // used when storage is unavailable: lasts until the page closes

function keyForCurrentUser() {
  const user = sessionManager.getUser();
  return user ? `${PREFIX}${user.userId ?? user.username}` : null;
}

export const setupStatus = {
  isComplete() {
    const key = keyForCurrentUser();
    if (!key) return false;
    if (fallback.has(key)) return true;
    try {
      return localStorage.getItem(key) === 'true';
    } catch {
      return false;
    }
  },

  markComplete() {
    const key = keyForCurrentUser();
    if (!key) return;
    fallback.add(key);
    try {
      localStorage.setItem(key, 'true');
    } catch {
      // Storage unavailable: setup counts as finished until this page closes.
    }
  },
};
