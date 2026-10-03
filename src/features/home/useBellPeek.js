import { useCallback, useEffect, useRef, useState } from 'react';
import usePresence from '@shared/hooks/usePresence.js';

// How long the "Nothing waiting" note stays under the bell before it fades.
const PEEK_MS = 1800;

// The short note under the bell when it is tapped with nothing waiting (Guide 7.5).
// Returns { mounted, visible, show }: render the note while `mounted`, fade it with `visible`, call show() on a tap.
export default function useBellPeek() {
  const [open, setOpen] = useState(false);
  const timer = useRef(0);
  const { mounted, visible } = usePresence(open);

  useEffect(() => () => clearTimeout(timer.current), []);

  const show = useCallback(() => {
    setOpen(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), PEEK_MS);
  }, []);

  return { mounted, visible, show };
}
