import { useSyncExternalStore } from 'react';
import { queryClient } from '@core/data/queryClient.js';

// Finds out when a newer build than the one running has been deployed, and wipes this device's app data to install it.
// The running build id is baked into the bundle (__APP_BUILD_ID__); /version.json always holds the newest deployed one.
// A fresh install downloads the newest bundle, so its id matches and it never sees an update.
export const CHECK_EVERY_MS = 3 * 60_000;
export const RUNNING_BUILD = typeof __APP_BUILD_ID__ === 'string' ? __APP_BUILD_ID__ : null;

// Kept through an update so the person stays signed in and the app still knows it is installed. Everything else in
// localStorage goes, including the device copy of the PIN (the server owns the PIN and re-teaches it on launch).
const KEEP_EXACT = new Set([
  'ahorra.session',
  'ahorra.installed',
  'ahorra.theme',
  'ahorra.reminder',
  'ahorra.reminder.nudge',
  'ahorra.lock.forgot',
  'ahorra.standin.push',
  'ahorra.standin.obligations',
]);
const KEEP_PREFIX = ['ahorra.setup.complete.'];
const isKept = (key) => KEEP_EXACT.has(key) || KEEP_PREFIX.some((prefix) => key.startsWith(prefix));

let state = { latest: null }; // the newer build id, or null when this build is current
const listeners = new Set();
const setState = (next) => {
  state = next;
  listeners.forEach((listener) => listener());
};

export const appUpdate = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => state,

  // One look at the deployed build id. Silent on any failure (offline, server asleep): the next round tries again.
  async check() {
    if (!import.meta.env.PROD || !RUNNING_BUILD) return;
    try {
      const response = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) return;
      const { buildId } = await response.json();
      if (typeof buildId === 'string' && buildId !== RUNNING_BUILD) setState({ latest: buildId });
    } catch {
      // Try again next round.
    }
  },

  // Checks now, every 3 minutes, and whenever the app comes back to the foreground. Call once.
  start() {
    appUpdate.check();
    setInterval(appUpdate.check, CHECK_EVERY_MS);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') appUpdate.check();
    });
  },

  // Removes the service worker, every cache, IndexedDB, sessionStorage and localStorage (except the keep-list), then
  // reloads into the new build. Each step is best effort so one refusal cannot strand the person on the old build.
  async install() {
    const attempt = async (step) => {
      try {
        await step();
      } catch {
        // Carry on with the rest.
      }
    };
    await attempt(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    });
    await attempt(async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    });
    await attempt(async () => {
      const databases = (await indexedDB.databases?.()) ?? [];
      await Promise.all(
        databases.map(
          (database) =>
            new Promise((resolve) => {
              const request = indexedDB.deleteDatabase(database.name);
              request.onsuccess = request.onerror = request.onblocked = () => resolve();
            }),
        ),
      );
    });
    await attempt(async () => sessionStorage.clear());
    await attempt(async () => {
      Object.keys(localStorage)
        .filter((key) => !isKept(key))
        .forEach((key) => localStorage.removeItem(key));
    });
    await attempt(async () => queryClient.clear());
    window.location.replace(`/?updated=${Date.now()}`);
  },
};

export const useAppUpdate = () => useSyncExternalStore(appUpdate.subscribe, appUpdate.getSnapshot);
