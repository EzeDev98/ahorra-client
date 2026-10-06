import { useState } from 'react';
import './LoadingScreen.css';
import { cx } from '@shared/utils/classNames.js';
import { DOT_CYCLE_MS, LOADING_COPY } from './loadingContent.js';

// The in-app loading screen: always dark (the page colour), with the logo, the tagline and three pulsing dots, between the native splash and
// the first screen. index.html holds an identical static copy that shows until React mounts, so nothing changes on
// screen at the hand-over. If you change this markup or LoadingScreen.css, change that copy too.
// The logo is the "A" alone on a transparent background (public/logo-mark.png), with a soft shadow so it stands out on white.
// leaving: set while the screen fades out over the first screen, so screen readers stop announcing it.
// page: for a route guard that is waiting. Same look, but it sits below the connection notice instead of covering it.
export default function LoadingScreen({ ref, leaving = false, page = false }) {
  // Where the dots are in their cycle, on the same clock index.html uses for its static copy (see its inline script), so the dots
  // carry on in step when this copy replaces that one. Worked out once, so a later render never makes them jump.
  const [phase] = useState(() => `${-(performance.now() % DOT_CYCLE_MS)}ms`);
  // How far the static copy's fade-in has got (index.html stamps when it first showed), so this copy continues it instead of restarting.
  const [intro] = useState(() => `${-Math.max(0, performance.now() - (window.__loadingShownAt ?? 0))}ms`);
  return (
    <div
      ref={ref}
      className={cx('loading-screen', page && 'loading-screen--page')}
      role="status"
      aria-label={LOADING_COPY.label}
      aria-hidden={leaving || undefined}
      style={{ '--loader-phase': phase, '--loader-intro-offset': intro }}
    >
      <img className="loading-screen__logo" src="/logo-mark.png" alt="" width="512" height="512" />
      <p className="loading-screen__tagline">{LOADING_COPY.tagline}</p>
      <span className="loading-screen__dots" aria-hidden="true">
        <span className="loading-screen__dot" />
        <span className="loading-screen__dot" />
        <span className="loading-screen__dot" />
      </span>
    </div>
  );
}
