// The single query cache. Data is kept in memory only: Ahorra is online-only, so nothing is stored for later.
// Screens show last-known data at once and refresh in the background. Use isPending (no data yet) for a
// spinner and never isFetching, so a background refresh never makes the UI blink.
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { ApiError } from '@core/http/httpClient.js';
import { queryKeys } from './queryKeys.js';

// Retry only transient failures, and only twice. Client errors (400, 401, 404, 409, 423, 429) never retry.
function shouldRetry(failureCount, error) {
  if (!(error instanceof ApiError)) return false;
  return (error.isNetwork || error.status >= 500) && failureCount < 2;
}

// 423 is the day gate. It is never an error toast: refresh the gate state and let Home react to it.
function handleGated(error) {
  if (error instanceof ApiError && error.isGated) {
    queryClient.invalidateQueries({ queryKey: queryKeys.day.all });
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleGated }),
  mutationCache: new MutationCache({ onError: handleGated }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      retry: shouldRetry,
      refetchOnWindowFocus: true, // a return to the foreground counts as opening the app (Guide 7.8)
      refetchOnReconnect: true,
    },
    mutations: { retry: false },
  },
});

// Call after a capture, confirm or edit: the gate state, the pending list and today's figures are all stale.
export function invalidateEntryData() {
  return queryClient.invalidateQueries({
    predicate: (query) => ['day', 'entries', 'report'].includes(query.queryKey[0]),
  });
}

// Call when the session ends, so the next person to sign in never sees the previous person's data.
export function clearQueryData() {
  queryClient.cancelQueries();
  queryClient.clear();
}
