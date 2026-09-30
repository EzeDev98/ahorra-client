// Owns the signed-in session: tokens, refresh and sign-out. Wired into the HTTP client from main.jsx.
import { ApiError, httpClient } from '@core/http/httpClient.js';
import { tokenStore } from './tokenStore.js';

const listeners = new Set();
let endedReason = null; // 'revoked' | 'expired' | null (null after a normal sign-out)
let refreshing = null;

const notify = () => listeners.forEach((listener) => listener());

function endLocal(reason) {
  if (!tokenStore.get()) return;
  tokenStore.clear();
  endedReason = reason;
  notify();
}

// Takes the fields of the POST /auth/login response. Call only when tokens were issued (not when mfaRequired).
function start({ accessToken, refreshToken, userId, username }) {
  if (!accessToken || !refreshToken) throw new Error('The login response carried no tokens.');
  tokenStore.set({ accessToken, refreshToken, userId, username });
  endedReason = null;
  notify();
}

async function requestNewTokens(current) {
  try {
    const data = await httpClient.post('/auth/refresh-token', { refreshToken: current.refreshToken }, { auth: false });
    if (!data?.accessToken) throw new ApiError({ status: 500, message: 'Unexpected response from the server.' });
    tokenStore.set({ ...current, accessToken: data.accessToken, refreshToken: data.refreshToken ?? current.refreshToken });
    return data.accessToken;
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error; // network, rate limit, server: keep the session
    const latest = tokenStore.reload();
    if (latest && latest.refreshToken !== current.refreshToken) return latest.accessToken; // another tab refreshed first
    endLocal('expired');
    return null;
  }
}

// Resolves to a usable access token, or null when the session is over. Rejects on transient failures.
// staleToken is the token a request was rejected with; if the stored one already differs, no refresh is needed.
function refresh(staleToken) {
  const current = tokenStore.get();
  if (!current) return Promise.resolve(null);
  if (staleToken && current.accessToken !== staleToken) return Promise.resolve(current.accessToken);
  refreshing ??= requestNewTokens(current).finally(() => {
    refreshing = null;
  });
  return refreshing;
}

function handleSessionRevoked(error) {
  endLocal(error?.isSessionRevoked ? 'revoked' : 'expired');
}

// Clears the local session first so the app responds at once, then tells the server on a best-effort basis.
async function signOut() {
  const token = tokenStore.get()?.accessToken;
  endLocal(null);
  if (!token) return;
  try {
    await httpClient.post('/logout/user', undefined, { auth: false, headers: { Authorization: `Bearer ${token}` } });
  } catch {
    // Best effort: the device is already signed out.
  }
}

function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

tokenStore.onExternalChange(notify);

export const sessionManager = {
  start,
  refresh,
  signOut,
  handleSessionRevoked,
  subscribe,
  getAccessToken: () => tokenStore.get()?.accessToken ?? null,
  hasSession: () => Boolean(tokenStore.get()),
  getUser: () => {
    const session = tokenStore.get();
    return session ? { userId: session.userId, username: session.username } : null;
  },
  getEndedReason: () => endedReason,
};
