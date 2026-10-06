import { sessionManager } from '@features/auth/session/sessionManager.js';
import { appearanceApi } from './appearanceApi.js';
import { themeStore } from './themeStore.js';

// Keeps the theme in step with the server. The copy on this device (themeStore) is what the first paint reads, so nothing
// waits for the network. Once signed in, the server confirms the choice on every launch and whenever the app comes back to
// the foreground. If it differs (changed on another device) the server wins and the copy here is replaced. A choice made
// here that the server has not accepted yet is marked pending and sent first, so it is never overwritten by an older value.
const PENDING_KEY = 'ahorra.theme.pending';

const pending = {
  is() {
    try {
      return localStorage.getItem(PENDING_KEY) === 'yes';
    } catch {
      return false;
    }
  },
  set(on) {
    try {
      if (on) localStorage.setItem(PENDING_KEY, 'yes');
      else localStorage.removeItem(PENDING_KEY);
    } catch {
      // Storage unavailable: the choice is simply not retried later.
    }
  },
};

// Colours the browser bar for a forced theme (the theme-color tags only follow the device). Reads the palette from the tokens.
function paintBrowserBar() {
  const style = getComputedStyle(document.documentElement);
  const colors = { light: style.getPropertyValue('--p-bg-light').trim(), dark: style.getPropertyValue('--p-bg-dark').trim() };
  if (!colors.light || !colors.dark) return;
  const mode = themeStore.get();
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    const own = meta.media.includes('dark') ? 'dark' : 'light';
    meta.content = colors[mode === 'system' ? own : mode];
  });
}

async function pushLocal() {
  await appearanceApi.set(themeStore.get().toUpperCase());
  pending.set(false);
}

async function sync() {
  if (pending.is()) return pushLocal();
  const { theme } = await appearanceApi.get();
  if (pending.is()) return pushLocal();
  if (theme) themeStore.set(theme.toLowerCase());
  else if (themeStore.get() !== 'system') await pushLocal(); // chosen before the server kept it
  return undefined;
}

let inflight = null;

// Resolves when the server has confirmed (or failed quietly). Safe to call often: calls share one request.
export function confirmTheme() {
  if (!sessionManager.hasSession()) return Promise.resolve();
  inflight ??= sync()
    .catch(() => {})
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

// The Appearance screen calls this: applies at once on this device, then tells the server.
export function chooseTheme(next) {
  themeStore.set(next);
  pending.set(true);
  if (sessionManager.hasSession()) pushLocal().catch(() => {});
}

// Call once from main.jsx, after the HTTP client is configured.
export function startThemeSync() {
  paintBrowserBar();
  themeStore.subscribe(paintBrowserBar);

  let wasSignedIn = sessionManager.hasSession();
  if (wasSignedIn) confirmTheme();
  sessionManager.subscribe(() => {
    const signedIn = sessionManager.hasSession();
    if (signedIn && !wasSignedIn) confirmTheme();
    wasSignedIn = signedIn;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') confirmTheme();
  });
}
