// Client-side rules for the reset screens, shared with registration so the two cannot drift apart.
// The server still has the last word: its message is shown when it refuses something this file let through.
import { MIN_PASSWORD_LENGTH, PHONE, cleanPhone } from '@features/auth/register/registerRules.js';

export { cleanPhone };

// Returns a message, or null when the number is fine.
export function validatePhone(value) {
  if (!value || !value.trim()) return 'Phone number is required.';
  if (!PHONE.test(cleanPhone(value.trim()))) return 'Phone number must be 11 digits and can start with +.';
  return null;
}

// Returns { newPassword?, confirmPassword? } holding only the fields that are wrong.
export function validateNewPassword({ newPassword, confirmPassword }) {
  const errors = {};

  if (!newPassword) errors.newPassword = 'Password is required.';
  else if (newPassword.length < MIN_PASSWORD_LENGTH) {
    errors.newPassword = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (!confirmPassword) errors.confirmPassword = 'Confirm your new password.';
  else if (confirmPassword !== newPassword) errors.confirmPassword = 'Passwords do not match.';

  return errors;
}
