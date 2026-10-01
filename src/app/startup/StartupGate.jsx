import { useEffect, useRef, useState } from 'react';
import { run } from '@core/motion/motion.js';
import LoadingScreen from '@shared/components/feedback/LoadingScreen.jsx';
import { decideStart } from './decideStart.js';

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

// The startup sequence (Guide §5): white native splash, then the loading screen, then one routing decision.
// Place it OUTSIDE the router. While the loading screen shows, the router is not mounted. When ready, the decision
// rewrites the address with history.replaceState, the router then mounts straight on the right screen, and the
// loading screen fades out over it. Nothing navigates and nothing flashes.
//   startPath          the launch route (Onboarding's path). The decision applies only when the app opens here;
//                      a deep link is left to the route guards (Step 5).
//   homeTo, welcomeTo  where the decision sends the person. Passed in so this file holds no path
//                      (Step 5 supplies them from routes.js).
export default function StartupGate({ startPath, homeTo, welcomeTo, children }) {
  const [phase, setPhase] = useState('loading'); // 'loading' | 'revealing' | 'done'
  const [launch] = useState(() => ({ startPath, homeTo, welcomeTo }));
  const screen = useRef(null);

  useEffect(() => {
    let cancelled = false;
    untilReady().then(() => {
      if (cancelled) return;
      const destination = { home: launch.homeTo, welcome: launch.welcomeTo }[decideStart()];
      if (destination && window.location.pathname === launch.startPath) {
        window.history.replaceState(window.history.state, '', destination);
      }
      setPhase('revealing');
    });
    return () => {
      cancelled = true;
    };
  }, [launch]);

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
