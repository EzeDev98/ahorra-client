// When the access token stops working, worked out on this device.
//
// The access token is a JWT, and its `exp` claim is a plain "seconds since 1970" value, so that is trusted first.
// The login and refresh responses also carry `expiresIn`; its unit is not confirmed (internal-auth-server is not in
// this repository), so it is only a fallback, read as seconds (the OAuth norm), and ignored if it looks too small to be.
// Whatever is unknown stays null, and the HTTP client's 401 recovery covers that case.

// A new access token is asked for when less than this remains.
export const REFRESH_LEAD_MS = 60_000;

// An expiresIn below this many seconds is probably in another unit, so it is not used.
const MIN_PLAUSIBLE_LIFETIME_S = 120;

function jwtExpiry(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

// Milliseconds since 1970 at which the token stops working, or null when that cannot be told.
export function accessExpiry(accessToken, expiresIn, now = Date.now()) {
  const fromToken = jwtExpiry(accessToken);
  if (fromToken) return fromToken;
  const seconds = Number(expiresIn);
  return Number.isFinite(seconds) && seconds >= MIN_PLAUSIBLE_LIFETIME_S ? now + seconds * 1000 : null;
}

// Same, for a stored session. Sessions saved before expiry was recorded have none stored, so it is read from the token.
export const sessionExpiry = (session) => session.accessExpiresAt ?? accessExpiry(session.accessToken);

// True when the token has run out or is about to. An unknown expiry is not "expiring".
export const isExpiring = (expiresAt, now = Date.now()) => expiresAt != null && expiresAt - now < REFRESH_LEAD_MS;
