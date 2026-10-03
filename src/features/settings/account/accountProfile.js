// The server has no profile endpoint, so the account details come from what sign-in returned: the access token is a JWT
// whose claims carry the username and, when the account has them, the email and phone number.

function claimsOf(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(payload);
    const text = decodeURIComponent(
      [...binary].map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''),
    );
    return JSON.parse(text);
  } catch {
    return {};
  }
}

const text = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null);

// { username, email, phone }: each a string, or null when the token does not carry it.
// fallbackUsername: the username the session stored at sign-in, used when the token has none.
export function accountProfile(token, fallbackUsername) {
  const claims = claimsOf(token ?? '');
  return {
    username: text(claims.username) ?? text(fallbackUsername),
    email: text(claims.email),
    phone: text(claims.phone_number),
  };
}
