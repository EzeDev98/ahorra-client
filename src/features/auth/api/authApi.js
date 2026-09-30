import { httpClient } from '@core/http/httpClient.js';

// All public endpoints: no token is sent and a 401 is returned as is.
const open = { auth: false };

export const authApi = {
  // POST /register-user
  // in:  { firstName, middleName?, lastName, username, email, phoneNumber, password, confirmPassword, dateOfBirth: 'yyyy-MM-dd' }
  // out: { username, statusCode, message }. 400 rule broken (message says which), 409 user exists.
  register: (body) => httpClient.post('/register-user', body, open),

  // POST /phone-number/verify
  // in:  { phoneNumber, otp }
  // out: { message }. 400 invalid or expired code, 429 too many attempts.
  verifyPhone: ({ phoneNumber, otp }) => httpClient.post('/phone-number/verify', { phoneNumber, otp }, open),

  // POST /phone-number/resend-verification
  // in:  { phoneNumber }
  // out: { message }. 429 resend cooldown.
  resendPhoneVerification: ({ phoneNumber }) => httpClient.post('/phone-number/resend-verification', { phoneNumber }, open),

  // POST /auth/login
  // in:  { username, password }
  // out: { userId, username, message, mfaRequired, accessToken, refreshToken, expiresIn, refreshExpiresIn }
  //      When mfaRequired is true no tokens are issued and the server cannot finish MFA (plan S7).
  //      Errors: 400 { message } when a field is blank, 401 wrong credentials. Unverified-phone response: confirm in 6d.
  login: ({ username, password }) => httpClient.post('/auth/login', { username, password }, open),

  // POST /password-reset/request
  // in:  { phoneNumber }
  // out: { message, statusCode, phoneNumber }. 429 rate limited.
  requestPasswordReset: ({ phoneNumber }) => httpClient.post('/password-reset/request', { phoneNumber }, open),

  // POST /password-reset/verify-otp
  // in:  { phoneNumber, otp }
  // out: { resetToken }. 400 invalid or expired code, 429 too many attempts.
  verifyResetOtp: ({ phoneNumber, otp }) => httpClient.post('/password-reset/verify-otp', { phoneNumber, otp }, open),

  // POST /password-reset/complete
  // in:  { resetToken, newPassword, confirmPassword }
  // out: { message, statusCode, phoneNumber }
  completePasswordReset: ({ resetToken, newPassword, confirmPassword }) =>
    httpClient.post('/password-reset/complete', { resetToken, newPassword, confirmPassword }, open),

  // Sign-out and token refresh are not here: sessionManager owns both (POST /logout/user, POST /auth/refresh-token).
};
