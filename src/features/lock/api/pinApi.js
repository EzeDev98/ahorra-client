import { httpClient } from '@core/http/httpClient.js';

// The app-lock PIN on the server. Every call needs a signed-in session (the default). A PIN is only ever sent in a
// request body, never in a URL. Errors: 400 { detail, attemptsRemaining? } for a refused or wrong PIN,
// 429 { detail, retryAfterSeconds } while the PIN is locked after too many wrong tries, 403 from reset when the person did
// not sign in within the last 10 minutes.
export const pinApi = {
  // GET /pin/status
  // out: { pinSet, locked, retryAfterSeconds }
  status: () => httpClient.get('/pin/status'),

  // POST /pin
  // in:  { pin, confirmPin }. out: { pinSet, locked, retryAfterSeconds }. 400 too easy to guess, not matching, or already set.
  set: (pin) => httpClient.post('/pin', { pin, confirmPin: pin }),

  // PUT /pin
  // in:  { oldPin, pin, confirmPin }. out: status. 400 wrong current PIN (attemptsRemaining), too easy, or the same as before.
  change: (oldPin, pin) => httpClient.put('/pin', { oldPin, pin, confirmPin: pin }),

  // POST /pin/verify
  // in:  { pin }. out: { valid: true }. 400 wrong PIN (attemptsRemaining), 429 locked (retryAfterSeconds).
  verify: (pin) => httpClient.post('/pin/verify', { pin }),

  // POST /pin/remove
  // in:  { pin }. out: status. Same errors as verify.
  remove: (pin) => httpClient.post('/pin/remove', { pin }),

  // POST /pin/reset
  // in:  { pin, confirmPin }. out: status. Replaces a forgotten PIN; only allowed within 10 minutes of signing in (else 403).
  reset: (pin) => httpClient.post('/pin/reset', { pin, confirmPin: pin }),
};
