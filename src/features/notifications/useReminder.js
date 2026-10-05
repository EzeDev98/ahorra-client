import { useEffect, useState } from 'react';
import { pushSupport } from '@core/pwa/pushSupport.js';
import { pushApi } from './api/pushApi.js';
import { disablePush, enablePush } from './pushSubscription.js';
import { reminderStore } from './reminderStore.js';

// State and actions for the Daily reminder screen (Step 12a). status is one of
//   'needs-install' | 'unsupported'  push cannot work here (see pushSupport)
//   'blocked'                        notifications are denied for this app
//   'off' | 'on'                     the person's choice
function startingStatus() {
  const support = pushSupport();
  if (support !== 'supported') return support;
  if (Notification.permission === 'denied') return 'blocked';
  return Notification.permission === 'granted' && reminderStore.isOn() ? 'on' : 'off';
}

export default function useReminder() {
  const [status, setStatus] = useState(startingStatus);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // The server holds the person's choice, so ask it when the screen opens. A failed lookup keeps what this device knows.
  useEffect(() => {
    if (status === 'needs-install' || status === 'unsupported') return undefined;
    let live = true;
    pushApi
      .getReminder()
      .then(({ enabled }) => {
        if (!live) return;
        reminderStore.set(enabled && Notification.permission === 'granted');
        setStatus(startingStatus());
      })
      .catch(() => {});
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const change = async (turnOn) => {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      if (turnOn) {
        const result = await enablePush();
        setStatus(result === 'on' ? 'on' : result === 'blocked' ? 'blocked' : 'off');
      } else {
        await disablePush();
        setStatus('off');
      }
    } catch (error) {
      console.error('Daily reminder change failed:', error?.status ?? '', error?.message ?? error, error);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return { status, busy, failed, turnOn: () => change(true), turnOff: () => change(false) };
}
