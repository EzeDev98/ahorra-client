import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@core/data/queryKeys.js';
import { dayApi } from './api/dayApi.js';

// GET /day/status: the gate state and the entries waiting for confirmation. staleTime 0 re-checks on every mount, and
// the query client refetches when the app returns to the foreground, so every app open sees the current queue (Guide 7.8).
//   status      { gated, reason, day, otherDaysRemaining, hardGateTime, pending }, or undefined until the first answer.
//               Step 9l reads the gate fields from here.
//   loadFailed  true only when there is nothing to show: the first load failed. A failed refresh after a good load keeps
//               the last list on screen.
//   retrying    a retry is in flight.
export default function useDayStatus() {
  const query = useQuery({ queryKey: queryKeys.day.status(), queryFn: dayApi.getStatus, staleTime: 0 });

  return {
    status: query.data,
    loadFailed: query.isError && !query.data,
    retrying: query.isFetching,
    retry: () => query.refetch(),
  };
}
