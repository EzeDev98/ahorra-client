import { useEffect, useSyncExternalStore } from 'react';
import { pushSupport } from '@core/pwa/pushSupport.js';
import { sessionManager } from '@features/auth/session/sessionManager.js';
import { enablePush, restoreReminder } from './pushSubscription.js';

// Brings the daily reminder back after a reinstall. Renders nothing. Once a person is signed in it asks the server whether
// the reminder is on. If the browser still allows notifications, this device subscribes again silently. If the browser
// went back to "ask", the question is put on the person's first tap anywhere in the app, so there is no extra box or banner.
// Allowing it switches the Settings box on; denying leaves it off.
export default function ReminderSync() {
  const signedIn = useSyncExternalStore(sessionManager.subscribe, sessionManager.hasSession);

  useEffect(() => {
    if (!signedIn || pushSupport() !== 'supported') return undefined;
    let cancelled = false;
    let stopWaiting = () => {};

    restoreReminder()
      .then((result) => {
        if (cancelled || result !== 'needs-tap') return;
        const onTap = () => {
          enablePush().catch(() => {});
        };
        document.addEventListener('click', onTap, { capture: true, once: true });
        stopWaiting = () => document.removeEventListener('click', onTap, true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      stopWaiting();
    };
  }, [signedIn]);

  return null;
}
