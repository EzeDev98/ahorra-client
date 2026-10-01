import { useSyncExternalStore } from 'react';
import { Navigate } from 'react-router';
import { lockState } from '@features/lock/lockState.js';

// Wraps a route that must stay hidden while the app is locked. Only does anything when app lock is on and has
// locked the app (Step 8); otherwise every screen passes straight through.
// redirectTo: the Unlock path, passed in so this file holds no path.
export default function UnlockGuard({ redirectTo, children }) {
  const locked = useSyncExternalStore(lockState.subscribe, lockState.isLocked);
  return locked ? <Navigate to={redirectTo} replace /> : children;
}
