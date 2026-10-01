// All forgot-password copy lives here, so changing a word never means touching the screens.
// OTP_LENGTH is password-reset.otp.length on the server (6).
export const OTP_LENGTH = 6;

export const REQUEST = {
  title: 'Forgot your password?',
  description: 'Enter the phone number on your account and we will text you a code.',
};

// The server answers the same whether or not the number has an account, so this never says a code was sent.
export const VERIFY = {
  title: 'Enter the code',
  description: (maskedPhone) => `If an account uses ${maskedPhone}, we sent a ${OTP_LENGTH}-digit code to it. Enter it below.`,
};

export const NEW_PASSWORD = {
  title: 'Create a new password',
  description: 'Choose a new password. Changing it signs you out of Ahorra on other devices.',
};

export const LABELS = {
  phoneNumber: 'Phone number',
  code: 'Verification code',
  newPassword: 'New password',
  confirmPassword: 'Confirm new password',
};

export const HINTS = {
  phoneNumber: 'The number you registered with, for example 08012345678.',
  newPassword: 'At least 8 characters.',
};

export const SHORT_CODE_ERROR = `Enter the ${OTP_LENGTH}-digit code.`;
export const GENERIC_ERROR = 'Something went wrong. Please try again.';
export const RESENT_TOAST = 'A new code is on its way.';
export const DONE_TOAST = 'Password changed. Sign in with your new password.';
