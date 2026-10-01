import { useSyncExternalStore } from 'react';
import { Navigate } from 'react-router';
import { sessionManager } from '@features/auth/session/sessionManager.js';

// Wraps a route that needs a signed-in person. No session sends them to Welcome. It watches the session, so signing
// out (or a revoked session) on any screen leaves that screen at once.
// A session that ended on its own (revoked, or expired beyond refreshing) lands on Login, which explains it; any other
// case lands on Welcome. redirectTo: Welcome. sessionEndedTo: Login. Passed in so this file holds no path.
export default function AuthGuard({ redirectTo, sessionEndedTo, children }) {
  const signedIn = useSyncExternalStore(sessionManager.subscribe, sessionManager.hasSession);
  if (signedIn) return children;
  return <Navigate to={sessionManager.getEndedReason() ? sessionEndedTo : redirectTo} replace />;
}
