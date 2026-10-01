import { useLayoutEffect, useRef } from 'react';
import useNetwork from '@shared/hooks/useNetwork.js';
import usePresence from '@shared/hooks/usePresence.js';
import ConnectionRequired from './ConnectionRequired.jsx';

// Covers the app with the "needs a connection" screen while offline. The app underneath stays mounted
// (and is made inert), so the user comes back to exactly where they were, with nothing stored for later.
export default function NetworkGate({ children }) {
  const { online } = useNetwork();
  const { mounted, visible } = usePresence(!online);
  const app = useRef(null);

  // Open dialogs, the side panel and toasts live in portals on <body>, outside the wrapper below, so they stay
  // reachable by keyboard. Make them inert too while offline, and give focus back when the connection returns.
  useLayoutEffect(() => {
    const root = app.current?.closest('body > *');
    if (online || !root) return undefined;

    const previous = document.activeElement;
    const outside = [...document.body.children].filter((element) => element !== root && !element.inert);
    outside.forEach((element) => {
      element.inert = true;
    });

    return () => {
      outside.forEach((element) => {
        element.inert = false;
      });
      if (previous instanceof HTMLElement && previous !== document.body && document.contains(previous)) {
        previous.focus({ preventScroll: true });
      }
    };
  }, [online]);

  return (
    <>
      <div ref={app} inert={!online}>
        {children}
      </div>
      {mounted && <ConnectionRequired visible={visible} />}
    </>
  );
}
