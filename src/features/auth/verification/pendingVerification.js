// Who is waiting to verify their phone, kept between screens: Register sets it, Verify phone (6c) reads it and
// clears it on success, and Login (6d) sets it when the server says a phone is unverified.
// Held in sessionStorage so a reload on the verify screen does not lose it, and gone when the app is closed.
// Holds the phone number, username and the time a new code may be asked for. Never a password.
const KEY = 'ahorra.pendingVerification';

// How long after a code is sent before another can be asked for. The server's own cooldown has the last word:
// its 429 on a resend moves this. [PROPOSED: 60 s matches the password-reset default; phone verification is
// handled by internal-auth-server, whose value is not confirmed.]
export const RESEND_COOLDOWN_MS = 60_000;

let memory = null; // used when storage is unavailable

function readStored() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(KEY));
    return parsed && typeof parsed.phoneNumber === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

function write(value) {
  memory = value;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Storage unavailable: it lasts until this page closes.
  }
}

export const pendingVerification = {
  // { phoneNumber, username, resendAvailableAt? } or null. resendAvailableAt is a time in milliseconds.
  get: () => readStored() ?? memory,

  set: ({ phoneNumber, username, resendAvailableAt }) => write({ phoneNumber, username, resendAvailableAt }),

  // Changes some fields and keeps the rest.
  update(changes) {
    const current = this.get();
    if (current) write({ ...current, ...changes });
  },

  clear() {
    memory = null;
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // Storage unavailable: nothing to remove.
    }
  },
};
