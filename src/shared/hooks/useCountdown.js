import { useEffect, useState } from 'react';

const secondsLeft = (until) => (until ? Math.max(0, Math.ceil((until - Date.now()) / 1000)) : 0);

// Whole seconds left until `until` (a time in milliseconds), counting down once a second. 0 when there is none or
// it has passed. Used by every "resend code" button.
export default function useCountdown(until) {
  const [seconds, setSeconds] = useState(() => secondsLeft(until));

  useEffect(() => {
    const tick = () => setSeconds(secondsLeft(until));
    tick();
    if (!until || until <= Date.now()) return undefined;
    const timer = setInterval(() => {
      tick();
      if (Date.now() >= until) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [until]);

  return seconds;
}
