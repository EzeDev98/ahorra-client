import { useSyncExternalStore } from 'react';

// Shown by every action that needs the server (capture, confirm, login) while there is no connection.
export const OFFLINE_MESSAGE = 'A connection is needed. Check your network and try again.';

const subscribe = (listener) => {
  addEventListener('online', listener);
  addEventListener('offline', listener);
  return () => {
    removeEventListener('online', listener);
    removeEventListener('offline', listener);
  };
};

const getSnapshot = () => navigator.onLine;

// Non-hook read, for use outside components.
export const isOnline = getSnapshot;

// { online }. Follows the browser's online and offline events.
export default function useNetwork() {
  return { online: useSyncExternalStore(subscribe, getSnapshot) };
}
