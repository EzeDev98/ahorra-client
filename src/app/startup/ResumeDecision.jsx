import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { decideRoute } from './decideRoute.js';

// Runs the same decision as launch whenever the app returns to the foreground, and moves the person only if the
// answer says they cannot stay where they are (for example the app has locked while it was away).
// Place it inside the router. It renders nothing.
export default function ResumeDecision() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const onVisible = async () => {
      if (document.visibilityState !== 'visible') return;
      const destination = await decideRoute({ launching: false, pathname });
      if (destination && destination !== window.location.pathname) navigate(destination, { replace: true });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [navigate, pathname]);

  return null;
}
