// Where the person is in the forgot-password flow, kept across its three screens.
//   phoneNumber, resendAvailableAt  in sessionStorage, so a reload on the code screen keeps the number and the cooldown.
//   resetToken                      in memory only. It lets whoever holds it set a new password (valid 10 minutes),
//                                   so it is never written to storage; a reload sends the person back to the start.
// Never holds a password.
const KEY = 'ahorra.passwordReset';

// How long after a code is sent before another can be asked for: password-reset.otp.resend-cooldown-seconds on the
// server (60). The server's own 429 has the last word.
export const RESEND_COOLDOWN_MS = 60_000;

let memory = null; // used when storage is unavailable
let resetToken = null;

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

export const passwordResetFlow = {
  // { phoneNumber, resendAvailableAt? } or null. resendAvailableAt is a time in milliseconds.
  get: () => readStored() ?? memory,

  // A code has just been requested for this number. Any earlier reset token no longer counts.
  begin({ phoneNumber, resendAvailableAt }) {
    resetToken = null;
    write({ phoneNumber, resendAvailableAt });
  },

  // Changes some fields and keeps the rest.
  update(changes) {
    const current = this.get();
    if (current) write({ ...current, ...changes });
  },

  getResetToken: () => resetToken,
  setResetToken(token) {
    resetToken = token;
  },
  clearResetToken() {
    resetToken = null;
  },

  clear() {
    memory = null;
    resetToken = null;
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // Storage unavailable: nothing to remove.
    }
  },
};
