import { useSyncExternalStore } from 'react';
import { Navigate } from 'react-router';
import { sessionManager } from '@features/auth/session/sessionManager.js';

// Wraps a route that needs a signed-in person. No session sends them to Welcome. It watches the session, so signing
// out (or a revoked session) on any screen leaves that screen at once.
// redirectTo: the Welcome path, passed in so this file holds no path.
export default function AuthGuard({ redirectTo, children }) {
  const signedIn = useSyncExternalStore(sessionManager.subscribe, sessionManager.hasSession);
  return signedIn ? children : <Navigate to={redirectTo} replace />;
}
