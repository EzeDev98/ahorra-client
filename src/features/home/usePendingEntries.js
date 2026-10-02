import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@core/data/queryKeys.js';
import { dayApi } from './api/dayApi.js';

// The entries waiting for confirmation, from GET /day/status. staleTime 0 re-checks on every mount (see queryKeys.js).
// Step 9f builds on this same read for the gate fields. undefined until the first answer.
export default function usePendingEntries() {
  const { data } = useQuery({ queryKey: queryKeys.day.status(), queryFn: dayApi.getStatus, staleTime: 0 });
  return data?.pending;
}
