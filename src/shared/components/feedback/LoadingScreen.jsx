import './LoadingScreen.css';
import AppLogo from '@shared/components/branding/AppLogo.jsx';
import { cx } from '@shared/utils/classNames.js';

// The in-app loading screen: white, with the logo, between the native splash and the first screen.
// index.html holds an identical static copy that shows until React mounts, so nothing changes on screen at the
// hand-over. If you change this markup or LoadingScreen.css, change that copy too.
// leaving: set while the screen fades out over the first screen, so screen readers stop announcing it.
// page: for a route guard that is waiting. Same look, but it sits below the connection notice instead of covering it.
export default function LoadingScreen({ ref, leaving = false, page = false }) {
  return (
    <div ref={ref} className={cx('loading-screen', page && 'loading-screen--page')} role="status" aria-label="Loading Ahorra" aria-hidden={leaving || undefined}>
      <AppLogo size="lg" />
    </div>
  );
}
