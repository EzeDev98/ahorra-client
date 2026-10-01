// Login only checks that both fields are filled; whether they are right is the server's call.
export function validateLogin(values) {
  const errors = {};
  if (!values.username.trim()) errors.username = 'Username is required.';
  if (!values.password) errors.password = 'Password is required.';
  return errors;
}

// The server has no code for "phone not verified": it passes on the wording from internal-auth-server. This reads
// that wording. [UNCONFIRMED: test with a registered but unverified account; if the message is not caught, add its wording here.]
export const UNVERIFIED_MESSAGE = /unverified|not (yet )?verified|verify your (phone|number|account)|phone.{0,20}verif/i;
