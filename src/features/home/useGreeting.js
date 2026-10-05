import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@core/data/queryKeys.js';
import { behaviorApi } from '@features/behavior/api/behaviorApi.js';
import { sessionManager } from '@features/auth/session/sessionManager.js';
import { greeting } from './greeting.js';

const CLOCK_TICK_MS = 60_000;

// The words for Home's greeting: the name, the device clock and the app mode (Guide 7.3).
// The clock moves on every minute and when the page becomes visible again, so a screen left open does not keep
// saying "Good morning" in the afternoon. The mode comes from GET /behavior/overview; until that has answered the
// sub-line stays empty, so it never swaps one message for another a moment after it appears.
// The first name is the one sign-in returned and the session stored. A session from before that was added has none,
// so the greeting reads "there" until the next sign-in.
export default function useGreeting() {
  const [now, setNow] = useState(() => new Date());
  const { data, isPending } = useQuery({ queryKey: queryKeys.behavior.overview(), queryFn: behaviorApi.getOverview });

  useEffect(() => {
    const tick = () => setNow(new Date());
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    const timer = setInterval(tick, CLOCK_TICK_MS);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const name = sessionManager.getUser()?.firstName;
  const words = greeting({ name, now, mode: data?.mode, daysObserved: data?.daysObserved });
  return { title: words.title, subtitle: isPending ? '' : words.subtitle };
}
