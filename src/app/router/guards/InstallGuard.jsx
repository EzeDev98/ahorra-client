import { Navigate } from 'react-router';
import { env } from '@core/config/env.js';
import { isPWAInstalled } from '@core/pwa/isPWAInstalled.js';

// Wraps a route that needs the installed app. In a browser tab it sends the user to the Install screen instead.
// redirectTo: the Install path, passed in so this file holds no path (Step 5 supplies it from routes.js).
// The Onboarding and Install routes are simply not wrapped.
export default function InstallGuard({ redirectTo, children }) {
  if (env.skipInstallGuard || isPWAInstalled()) return children;
  return <Navigate to={redirectTo} replace />;
}
