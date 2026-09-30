// Where the session lives between launches. The only file that touches storage, so moving it is a one-file change.
const KEY = 'ahorra.session';

let cache; // undefined = not read yet, null = no session

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    return parsed && typeof parsed.accessToken === 'string' && typeof parsed.refreshToken === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

export const tokenStore = {
  get() {
    if (cache === undefined) cache = read();
    return cache;
  },

  // Forces a fresh read from storage (another tab may have changed it).
  reload() {
    cache = undefined;
    return this.get();
  },

  set(session) {
    cache = session;
    try {
      localStorage.setItem(KEY, JSON.stringify(session));
    } catch {
      // Storage unavailable: the session lasts until this page closes.
    }
  },

  clear() {
    cache = null;
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Storage unavailable: nothing to remove.
    }
  },

  // Calls listener when another tab or window changes the stored session. Returns an unsubscribe function.
  onExternalChange(listener) {
    const handler = (event) => {
      if (event.key !== KEY && event.key !== null) return;
      cache = undefined;
      listener();
    };
    addEventListener('storage', handler);
    return () => removeEventListener('storage', handler);
  },
};
