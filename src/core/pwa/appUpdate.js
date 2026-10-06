import { useSyncExternalStore } from 'react';
import { queryClient } from '@core/data/queryClient.js';

// Finds out when a newer build than the one running has been deployed, and wipes this device's app data to install it.
// The running build id is baked into the bundle (__APP_BUILD_ID__); /version.json always holds the newest deployed one.
export const CHECK_EVERY_MS = 3 * 60_000;
export const RUNNING_BUILD = typeof __APP_BUILD_ID__ === 'string' ? __APP_BUILD_ID__ : null;

// The build this device last fully reset for. Kept apart from the running bundle on purpose: page loads are network-first,
// so a plain reload runs the newest bundle even though the old service worker and its caches are still serving old files
// (icons, logo, fonts). Without this marker that device would look "up to date" and never be offered the reset.
const APPLIED_KEY = 'ahorra.applied.build';
// The only thing that survives a reset: the fact that the app is installed on this device.
const INSTALLED_KEY = 'ahorra.installed';
// Kept through the wipe: the install marker, and the theme choice with its unsent flag, so an update never changes how the app looks.
// The theme keys are the ones themeStore.js and themeSync.js own.
const KEPT_KEYS = [INSTALLED_KEY, 'ahorra.theme', 'ahorra.theme.pending'];

const readApplied = () => {
  try {
    return localStorage.getItem(APPLIED_KEY);
  } catch {
    return null;
  }
};
const writeApplied = (buildId) => {
  try {
    if (buildId) localStorage.setItem(APPLIED_KEY, buildId);
  } catch {
    // Storage unavailable: the next check simply offers the update again.
  }
};

let state = { latest: null }; // the build id to install, or null when this device is current
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
  // An update is due when the deployed build differs from the running one, or from the one this device last reset for.
  async check() {
    if (!import.meta.env.PROD || !RUNNING_BUILD) return;
    try {
      const response = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) return;
      const { buildId } = await response.json();
      if (typeof buildId !== 'string') return;
      if (buildId !== RUNNING_BUILD || buildId !== readApplied()) setState({ latest: buildId });
    } catch {
      // Try again next round.
    }
  },

  // Checks now, every 3 minutes, and whenever the app comes back to the foreground. Call once.
  start() {
    // A brand-new device (no service worker controlling the page yet) has nothing stale, so it starts out current.
    // A device that already has a worker has no marker yet, so it is offered one reset to clear what is stuck.
    if (readApplied() === null && !navigator.serviceWorker?.controller) writeApplied(RUNNING_BUILD);
    appUpdate.check();
    setInterval(appUpdate.check, CHECK_EVERY_MS);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') appUpdate.check();
    });
  },

  // Full hard reset: removes the service worker, every cache, IndexedDB, sessionStorage and localStorage, then reloads into
  // the new build. Each step is best effort so one refusal cannot strand the person on the old build.
  async install() {
    const target = state.latest ?? RUNNING_BUILD;
    const attempt = async (step) => {
      try {
        await step();
      } catch {
        // Carry on with the rest.
      }
    };
    // The worker goes first, so nothing can refill a cache that is about to be deleted.
    await attempt(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    });
    await attempt(async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    });
    await attempt(async () => {
      // Browsers without indexedDB.databases() (older Firefox) have nothing listed to delete.
      const databases = (await indexedDB.databases?.()) ?? [];
      await Promise.all(
        databases
          .filter((database) => database.name)
          .map(
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
      const kept = KEPT_KEYS.map((key) => [key, localStorage.getItem(key)]);
      localStorage.clear();
      kept.forEach(([key, value]) => {
        if (value !== null) localStorage.setItem(key, value);
      });
    });
    // The wipe removed the marker, so write it back or the next check offers the same update again.
    writeApplied(target);
    await attempt(async () => queryClient.clear());
    // The query string makes the reload a new address, so no HTTP cache can answer it.
    window.location.replace(`/?updated=${Date.now()}`);
  },
};

export const useAppUpdate = () => useSyncExternalStore(appUpdate.subscribe, appUpdate.getSnapshot);
