import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@core/data/queryKeys.js';
import { behaviorApi } from '@features/behavior/api/behaviorApi.js';
import { greeting } from './greeting.js';

const CLOCK_TICK_MS = 60_000;

// The words for Home's greeting: the name, the device clock and the app mode (Guide 7.3).
// The clock moves on every minute and when the page becomes visible again, so a screen left open does not keep
// saying "Good morning" in the afternoon. The mode comes from GET /behavior/overview; until that has answered the
// sub-line stays empty, so it never swaps one message for another a moment after it appears.
// name: the first name. The server does not send one yet, so Home passes none and the greeting reads "there".
export default function useGreeting({ name } = {}) {
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

  const words = greeting({ name, now, mode: data?.mode, daysObserved: data?.daysObserved });
  return { title: words.title, subtitle: isPending ? '' : words.subtitle };
}
