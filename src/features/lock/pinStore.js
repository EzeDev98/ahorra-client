// The app-lock PIN, kept on this device only. The PIN itself is never stored and never sent to the server: only a
// salted, slow hash of it. Per person (key: ahorra.lock.pin.<userId>), so two accounts on one device have their own.
//
// This is a screen lock, not encryption. Someone who can read this device's storage could still try every 6-digit
// PIN offline, so the attempt limit (Step 8b) is friction against casual access, not a hard barrier (Guide 6.3).
//
// The hash is PBKDF2-SHA-256 from the browser's Web Crypto, which only exists in a secure context (HTTPS, or
// localhost). Elsewhere isSupported() is false and set() refuses.
import { sessionManager } from '@features/auth/session/sessionManager.js';

export const PIN_LENGTH = 6;

const PREFIX = 'ahorra.lock.pin.';
const ITERATIONS = 310_000; // stored with each hash, so it can be raised later without breaking existing PINs
const SALT_BYTES = 16;
const HASH_BITS = 256;

// Wrong-PIN policy (Step 8b). Every 5th wrong PIN in a row starts a wait: 30 seconds, doubling each round, never more
// than 15 minutes. A right PIN clears the count. It is kept in the record, so closing the app does not reset it. Like the
// PIN itself this only stops casual attempts: someone who can edit this device storage can reset the count.
const ATTEMPTS_PER_ROUND = 5;
const FIRST_WAIT_MS = 30_000;
const LONGEST_WAIT_MS = 15 * 60_000;
const PIN_PATTERN = new RegExp(`^\\d{${PIN_LENGTH}}$`);

const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener());

// Another tab turned the lock on or off.
addEventListener('storage', (event) => {
  if (event.key === null || event.key.startsWith(PREFIX)) notify();
});

function keyForCurrentUser() {
  const user = sessionManager.getUser();
  return user ? `${PREFIX}${user.userId ?? user.username}` : null;
}

// { v, iterations, length, salt, hash } or null. Anything that does not look like a record counts as no PIN.
function readRecord(key) {
  if (!key) return null;
  try {
    const record = JSON.parse(localStorage.getItem(key));
    const valid =
      record &&
      record.v === 1 &&
      Number.isInteger(record.iterations) &&
      Number.isInteger(record.length) &&
      typeof record.salt === 'string' &&
      typeof record.hash === 'string';
    return valid ? record : null;
  } catch {
    return null;
  }
}

const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (text) => Uint8Array.from(atob(text), (char) => char.charCodeAt(0));

async function derive(pin, salt, iterations) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, material, HASH_BITS);
  return new Uint8Array(bits);
}

// Compares every byte, so the time taken does not reveal how much of a guess was right.
function sameBytes(a, b) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

// Writing is best effort: if it fails the count is simply not remembered.
function writeRecord(key, record) {
  try {
    localStorage.setItem(key, JSON.stringify(record));
  } catch {
    // Not remembered.
  }
}

// How long the wait is after this many wrong PINs in total (always a multiple of ATTEMPTS_PER_ROUND).
const waitAfter = (failures) => Math.min(FIRST_WAIT_MS * 2 ** (failures / ATTEMPTS_PER_ROUND - 1), LONGEST_WAIT_MS);

// { attemptsLeft, lockedUntil } for a stored record. lockedUntil is null once a wait is over.
function attemptState(record) {
  const failures = record?.failures ?? 0;
  const lockedUntil = record?.lockedUntil > Date.now() ? record.lockedUntil : null;
  return { attemptsLeft: ATTEMPTS_PER_ROUND - (failures % ATTEMPTS_PER_ROUND), lockedUntil };
}

const isSupported = () => Boolean(globalThis.crypto?.subtle);

export const pinStore = {
  // False outside a secure context (plain http on a network address, for example).
  isSupported,

  // Whether the signed-in person has a PIN, which is what "app lock is on" means. Fine for useSyncExternalStore.
  has: () => readRecord(keyForCurrentUser()) !== null,

  // How many digits the stored PIN has (for drawing the right number of boxes), or null without a PIN.
  getLength: () => readRecord(keyForCurrentUser())?.length ?? null,

  // Stores a new PIN, replacing any existing one. The caller has already checked the current PIN when changing.
  async set(pin) {
    const key = keyForCurrentUser();
    if (!key) throw new Error('Sign in before setting a PIN.');
    if (!PIN_PATTERN.test(pin)) throw new Error(`A PIN is ${PIN_LENGTH} digits.`);
    if (!isSupported()) throw new Error('A PIN cannot be set in this browser context.');

    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const hash = await derive(pin, salt, ITERATIONS);
    const record = { v: 1, algorithm: 'PBKDF2-SHA256', iterations: ITERATIONS, length: PIN_LENGTH, salt: toBase64(salt), hash: toBase64(hash), failures: 0, lockedUntil: 0 };
    try {
      localStorage.setItem(key, JSON.stringify(record));
    } catch {
      throw new Error('Could not save the PIN on this device.');
    }
    notify();
  },

  // Checks pin against the stored one and applies the wrong-PIN policy. Resolves { ok, attemptsLeft, lockedUntil }:
  //   ok            true only for the right PIN, which also clears the count of wrong ones.
  //   attemptsLeft  how many more wrong PINs are allowed before the next wait (counts down within each round of 5).
  //   lockedUntil   a time in milliseconds while a wait is running, else null. During a wait the PIN is not checked at all.
  // A PIN of the wrong length, no stored PIN, or an unsupported context is simply not ok and is not counted.
  async verify(pin) {
    const key = keyForCurrentUser();
    const record = readRecord(key);
    const state = attemptState(record);
    if (!record || !isSupported() || state.lockedUntil) return { ok: false, ...state };
    if (typeof pin !== 'string' || pin.length !== record.length) return { ok: false, ...state };

    const hash = await derive(pin, fromBase64(record.salt), record.iterations);
    if (sameBytes(hash, fromBase64(record.hash))) {
      if (record.failures) writeRecord(key, { ...record, failures: 0, lockedUntil: 0 });
      return { ok: true, attemptsLeft: ATTEMPTS_PER_ROUND, lockedUntil: null };
    }

    const failures = (record.failures ?? 0) + 1;
    const next = { ...record, failures, lockedUntil: failures % ATTEMPTS_PER_ROUND === 0 ? Date.now() + waitAfter(failures) : 0 };
    writeRecord(key, next);
    return { ok: false, ...attemptState(next) };
  },

  // The current count and wait without trying a PIN: { attemptsLeft, lockedUntil }. For showing a wait that began earlier.
  getAttempts: () => attemptState(readRecord(keyForCurrentUser())),

  // Turns the lock off for the signed-in person. The caller has already checked the current PIN (turning it off in
  // Settings) or is signing the person out because they forgot it (Step 8e).
  remove() {
    const key = keyForCurrentUser();
    if (!key) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable: nothing to remove.
    }
    notify();
  },

  // Calls listener whenever the PIN is set or removed, here or in another tab. Returns the unsubscribe function.
  subscribe(listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
