import { useEffect, useRef, useState } from 'react';
import { run } from '@core/motion/motion.js';
import LoadingScreen from '@shared/components/feedback/LoadingScreen.jsx';
import { ROUTES } from '@app/router/routes.js';
import { detectInstalledApp } from '@core/pwa/isPWAInstalled.js';
import { decideRoute } from './decideRoute.js';

// Fewest milliseconds the loading screen stays up, counted from when the page started loading: a fast start
// does not flash it, and a slow start is not made slower. [PROPOSED]
const MIN_VISIBLE_MS = 500;
// Longest the start waits for the font. After this it carries on without it.
const FONT_WAIT_MS = 1500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function untilReady() {
  await Promise.race([document.fonts?.ready, sleep(FONT_WAIT_MS)]);
  await sleep(MIN_VISIBLE_MS - performance.now());
}

// The startup sequence (Guide §5): white native splash, then the loading screen, then one routing decision
// (decideRoute.js). Place it OUTSIDE the router. While the loading screen shows, the router is not mounted. When
// ready, the answer is written to the address with history.replaceState, the router then mounts straight on the right
// screen, and the loading screen fades out over it. Nothing navigates and nothing flashes.
// The decision applies only when the app opens at the start route (Onboarding's path); a deep link is left to the
// route guards.
export default function StartupGate({ children }) {
  const [phase, setPhase] = useState('loading'); // 'loading' | 'revealing' | 'done'
  const screen = useRef(null);

  useEffect(() => {
    let cancelled = false;
    // The decision starts at once, alongside the wait for the font and the minimum time, so neither delays the other.
    Promise.all([untilReady(), detectInstalledApp().then(() => decideRoute({ launching: true })).catch(() => null)]).then(([, destination]) => {
      if (cancelled) return;
      if (destination && window.location.pathname === ROUTES.onboarding) {
        window.history.replaceState(window.history.state, '', destination);
      }
      setPhase('revealing');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // The first screen is now mounted under the loading screen. Give it one frame to paint, then fade the cover away.
  useEffect(() => {
    if (phase !== 'revealing') return undefined;
    let cancelled = false;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (!screen.current) return;
        run(screen.current, [{ opacity: 1 }, { opacity: 0 }], { duration: 'base', ease: 'standard', fill: 'forwards' }).then(() => {
          if (!cancelled) setPhase('done');
        });
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [phase]);

  return (
    <>
      {phase !== 'loading' && children}
      {phase !== 'done' && <LoadingScreen ref={screen} leaving={phase === 'revealing'} />}
    </>
  );
}
