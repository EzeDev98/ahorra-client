import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@core/data/queryKeys.js';
import { msUntilGate } from './gate.js';

// The gate can start while Home is open: at the hard gate time, today's pending entries turn it on. The day status
// is otherwise only read when the app opens or returns to the foreground, so this asks again at that moment and the
// gate appears without a reload. Only waits when it matters: not yet gated, with entries pending.
// A computer that sleeps through the moment is covered by the refetch on returning to the foreground.
export default function useGateWatch(status) {
  const queryClient = useQueryClient();
  const hardGateTime = status && !status.gated && status.pending?.length > 0 ? status.hardGateTime : null;

  useEffect(() => {
    const wait = msUntilGate(hardGateTime);
    if (wait === null) return undefined;
    const timer = setTimeout(() => queryClient.invalidateQueries({ queryKey: queryKeys.day.status() }), wait);
    return () => clearTimeout(timer);
  }, [hardGateTime, queryClient]);
}
