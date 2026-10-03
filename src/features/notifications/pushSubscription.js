import { env } from '@core/config/env.js';
import { isStandIn } from '@core/http/standIn.js';
import { pushApi } from './api/pushApi.js';
import { reminderStore } from './reminderStore.js';

// The browser half of the daily reminder (Steps 12a and 12b): ask for permission, create the push subscription through the
// service worker, and hand it to pushApi. The worker's own handlers are Step 12c.

// Stand-in only: with no VAPID key (or no worker in development) there is no real subscription to send.
const STAND_IN_ENDPOINT = 'stand-in:this-device';
// In development the worker is removed, so `ready` would wait forever. Give it a moment, then carry on without it.
const READY_WAIT_MS = 4000;

const waitForWorker = () =>
  Promise.race([navigator.serviceWorker.ready, new Promise((resolve) => setTimeout(() => resolve(null), READY_WAIT_MS))]);

function keyToBytes(base64Url) {
  const padded = base64Url.padEnd(base64Url.length + ((4 - (base64Url.length % 4)) % 4), '=');
  const raw = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

// Call from a tap: browsers only show the permission question in answer to one.
// Returns 'on', 'blocked' (the person said no, or it was already blocked) or 'dismissed' (the question was closed).
// Throws when the subscription could not be created or sent, and then nothing is switched on.
export async function enablePush() {
  const permission = await Notification.requestPermission();
  if (permission === 'denied') return 'blocked';
  if (permission !== 'granted') return 'dismissed';

  const registration = await waitForWorker();
  if (env.vapidPublicKey && registration) {
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(env.vapidPublicKey) }));
    await pushApi.subscribe(subscription.toJSON());
  } else if (isStandIn('push')) {
    await pushApi.subscribe({ endpoint: STAND_IN_ENDPOINT, keys: {} });
  } else {
    throw new Error('Web push is not configured: VITE_VAPID_PUBLIC_KEY is empty.');
  }

  reminderStore.set(true);
  return 'on';
}

// Tells the server first, so a failure leaves the reminder on and the screen honest. Throws on failure.
export async function disablePush() {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  await pushApi.unsubscribe(subscription?.endpoint ?? STAND_IN_ENDPOINT);
  await subscription?.unsubscribe();
  reminderStore.set(false);
}
