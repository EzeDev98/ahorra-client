import { parkedEntries } from './parkedEntries.js';

let started = false;

// Opening the app again sends every parked entry back to Home (Guide 7.8): "opening" is a launch (memory starts empty, so
// nothing to do) and the page becoming visible again, including a restore from the browser's back-forward cache.
// Settling pending entries is not optional, so the bell never holds anything across an app open. Called once from main.jsx.
export function startResurface() {
  if (started) return;
  started = true;

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') parkedEntries.resurface();
  });
  addEventListener('pageshow', (event) => {
    if (event.persisted) parkedEntries.resurface();
  });
}
