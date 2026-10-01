import { useState } from 'react';
import { Navigate } from 'react-router';
import { setupStatus } from '@features/setup/setupStatus.js';

// Wraps a first-run screen (income, fixed obligations, the lock offer). Once setup is finished these are not for the
// person any more, so a direct visit goes to the app. It is checked once, when the screen mounts: finishing setup from
// the last screen must not redirect it a second time while it is still fading out.
// redirectTo: the Home path, passed in so this file holds no path.
export default function FirstRunGuard({ redirectTo, children }) {
  const [finished] = useState(setupStatus.isComplete);
  return finished ? <Navigate to={redirectTo} replace /> : children;
}
