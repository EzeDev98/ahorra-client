// All Verify phone copy lives here, so changing a word never means touching the screen.
// OTP_LENGTH [PROPOSED]: 6 matches the password-reset code on this server; the phone-verification code is made by
// internal-auth-server and its length is not confirmed. If it differs, this is the one line to change.
export const OTP_LENGTH = 6;

export const TITLE = 'Verify your phone';

export const description = (maskedPhone) => `We sent a ${OTP_LENGTH}-digit code to ${maskedPhone}. Enter it below.`;

export const CODE_LABEL = 'Verification code';
export const SHORT_CODE_ERROR = `Enter the ${OTP_LENGTH}-digit code.`;
export const GENERIC_ERROR = 'Something went wrong. Please try again.';
export const VERIFIED_TOAST = 'Phone verified. Sign in to continue.';
export const RESENT_TOAST = 'A new code is on its way.';
