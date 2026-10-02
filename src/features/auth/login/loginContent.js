// All Login copy lives here, so changing a word never means touching the screen.
export const TITLE = 'Sign in';
export const DESCRIPTION = 'Welcome back. Enter your username and password.';

export const LABELS = { username: 'Username', password: 'Password' };

export const WRONG_CREDENTIALS = 'Incorrect username or password.';
export const GENERIC_ERROR = 'Something went wrong. Please try again.';

// mfaRequired: the server cannot finish a second verification step (plan S7), so nobody can be signed in.
export const MFA = {
  title: 'Extra verification needed',
  text: 'This account asks for a second verification step, which Ahorra cannot complete yet. Please try again later.',
};

// Shown above the form when the session ended on its own (the reason comes from sessionManager.getEndedReason()).
export const SESSION_ENDED = {
  revoked: {
    title: 'You were signed out',
    text: 'Your session ended. This can happen if you signed in on another device or changed your password. Sign in again to continue.',
  },
  expired: {
    title: 'Your session expired',
    text: 'Please sign in again to continue.',
  },
  forgotPin: {
    title: 'App lock is off',
    text: 'You signed out because you forgot your PIN. Sign in to continue. You can set a new PIN in Settings.',
  },
};
