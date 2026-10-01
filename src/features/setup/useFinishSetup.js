import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { setupStatus } from './setupStatus.js';

// The end of first-run setup. Returns a function that records setup as finished on this device and goes to the app.
// The history entry is replaced, so Back never returns to a setup screen, and the route transition for a
// replacement is a plain fade. Called by "Skip for now" on the lock offer, and by Set PIN (Step 8c) when it was
// opened from setup (useLocation().state?.fromSetup).
// homeTo: the Home path, passed in so this file holds no path.
export default function useFinishSetup(homeTo) {
  const navigate = useNavigate();
  return useCallback(() => {
    setupStatus.markComplete();
    navigate(homeTo, { replace: true });
  }, [navigate, homeTo]);
}
