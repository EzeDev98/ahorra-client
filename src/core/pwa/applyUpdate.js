// Picks up a new build without the person seeing a half-updated app (Step 13d).
//   1. A new build installs in the background and waits (public/sw.js).
//   2. When the app goes to the background, a waiting build is told to take over. Nothing changes on screen: the page that
//      is running is a single bundle and already holds everything it needs.
//   3. When the app comes back to the front after that, it reloads once, so the person is on the new build. A reload is
//      held back while any field holds typed text, and tried again on the next return.
// A first install is not an update, so it never reloads.
let reloadOnReturn = false;

const activateWaiting = (registration) => {
  if (navigator.serviceWorker.controller) registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
};

const hasTypedText = () =>
  [...document.querySelectorAll('textarea, input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"])')].some(
    (field) => field.value.trim() !== '',
  );

export function watchForUpdate(registration) {
  const hadWorker = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadWorker) reloadOnReturn = true;
  });

  // A build that finishes installing while the app is already in the background is applied at once.
  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    installing?.addEventListener('statechange', () => {
      if (installing.state === 'installed' && document.visibilityState === 'hidden') activateWaiting(registration);
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') activateWaiting(registration);
    else if (reloadOnReturn && !hasTypedText()) window.location.reload();
  });
}
