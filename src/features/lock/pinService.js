// The app-lock PIN, checked by the server and kept on this device as a salted hash (pinStore) so it can also be checked
// without a connection. The server owns the PIN and counts wrong attempts; the device copy is only a fallback for when
// the server cannot be reached. Screens call this, not pinApi or pinStore.verify, and get the same
// { ok, attemptsLeft, lockedUntil } answer pinStore.verify gave.
import { ApiError } from '@core/http/httpClient.js';
import { sessionManager } from '@features/auth/session/sessionManager.js';
import { isOnline } from '@shared/hooks/useNetwork.js';
import { pinApi } from './api/pinApi.js';
import { UNLOCK } from './lockContent.js';
import { pinStore } from './pinStore.js';

const MAX_ATTEMPTS = 5; // the server's limit; only used to word a right answer
const SYNC_WAIT_MS = 3000; // longest a launch waits to learn whether the server has a PIN
const FORGOT_KEY = 'ahorra.lock.forgot'; // who asked for a new PIN after "Forgot PIN? Sign in again"
const ACCEPTED = { ok: true, attemptsLeft: MAX_ATTEMPTS, lockedUntil: null };

const tooSlow = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Too slow')), ms));
const unreachable = (error) => error instanceof ApiError && (error.isNetwork || error.status >= 500);

// The server's refusal of a PIN, in the shape the screens use. null when the error is not a refusal of the PIN.
function refusal(error) {
  if (!(error instanceof ApiError)) return null;
  const retry = error.body?.retryAfterSeconds;
  if (error.isRateLimited && Number.isFinite(retry)) return { ok: false, attemptsLeft: 0, lockedUntil: Date.now() + retry * 1000 };
  const left = error.body?.attemptsRemaining;
  if (error.status === 400 && Number.isInteger(left)) return { ok: false, attemptsLeft: left, lockedUntil: null };
  return null;
}

const requireConnection = () => {
  if (!isOnline()) throw new Error(UNLOCK.needsConnection);
};

// Keeps the device copy in step with a PIN the server has just accepted. Best effort: without it only offline checks suffer.
async function keepOnDevice(pin) {
  try {
    await pinStore.set(pin);
  } catch {
    // Not stored on this device.
  }
  pinStore.markRemote(true);
}

const forgotOwner = () => {
  const user = sessionManager.getUser();
  return user ? String(user.userId ?? user.username) : null;
};

function clearForgot() {
  try {
    localStorage.removeItem(FORGOT_KEY);
  } catch {
    // Nothing to clear.
  }
}

export const pinService = {
  // Checks a PIN: the server first, and this device's copy when the server cannot be reached.
  async verify(pin) {
    if (isOnline()) {
      try {
        await pinApi.verify(pin);
        await keepOnDevice(pin);
        return ACCEPTED;
      } catch (error) {
        const refused = refusal(error);
        if (refused) return refused;
        // The PIN was removed elsewhere: there is nothing left to ask for.
        if (error instanceof ApiError && error.status === 400 && /no pin is set/i.test(error.message)) {
          pinStore.remove();
          return ACCEPTED;
        }
        if (!unreachable(error)) throw error;
      }
    }
    if (pinStore.hasLocal()) return pinStore.verify(pin);
    throw new Error(UNLOCK.needsConnection);
  },

  // Turns the lock on. Needs a connection.
  async set(pin) {
    requireConnection();
    await pinApi.set(pin);
    await keepOnDevice(pin);
  },

  // Replaces the PIN. Needs a connection.
  async change(oldPin, pin) {
    requireConnection();
    await pinApi.change(oldPin, pin);
    await keepOnDevice(pin);
  },

  // Turns the lock off; the current PIN is checked by the server. Resolves like verify. Needs a connection.
  async remove(pin) {
    requireConnection();
    try {
      await pinApi.remove(pin);
    } catch (error) {
      const refused = refusal(error);
      if (refused) return refused;
      throw error;
    }
    pinStore.remove();
    clearForgot();
    return ACCEPTED;
  },

  // Replaces a forgotten PIN, right after signing in again. Needs a connection.
  async reset(pin) {
    requireConnection();
    await pinApi.reset(pin);
    clearForgot();
    await keepOnDevice(pin);
  },

  // "Forgot PIN? Sign in again": remembers to ask for a new PIN after the next sign-in, and drops this device's copy.
  // Call before signing out. The PIN on the server stays until it is replaced.
  forgot() {
    const owner = forgotOwner();
    if (owner) {
      try {
        localStorage.setItem(FORGOT_KEY, owner);
      } catch {
        // Not remembered: the person meets Unlock again and can start over.
      }
    }
    pinStore.remove();
  },

  // True when the signed-in person asked for a new PIN and has not set it yet.
  resetPending() {
    try {
      const owner = forgotOwner();
      return owner !== null && localStorage.getItem(FORGOT_KEY) === owner;
    } catch {
      return false;
    }
  },

  clearForgot,

  // Learns from the server whether this person has a PIN, so a PIN set on another device (or removed there) is followed.
  // Waits only briefly and changes nothing on any failure.
  async sync() {
    if (!sessionManager.hasSession() || !isOnline()) return;
    try {
      const status = await Promise.race([pinApi.status(), tooSlow(SYNC_WAIT_MS)]);
      if (status?.pinSet) {
        pinStore.markRemote(true);
      } else {
        pinStore.remove();
        clearForgot();
      }
    } catch {
      // Keep what this device already knows.
    }
  },
};
