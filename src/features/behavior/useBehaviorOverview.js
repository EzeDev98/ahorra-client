import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@core/data/queryKeys.js';
import { behaviorApi } from './api/behaviorApi.js';

// GET /behavior/overview: the mode, baselines, habits, trend and the unusual-day signal. It shares its cache entry with the
// greeting on Home, and re-checks at every visit (staleTime 0) since confirming entries changes these figures; the last
// answer still shows at once.
//   overview    the response, or undefined until the first answer.
//   isPending   no answer yet: show the spinner.
//   loadFailed  the first load failed, so there is nothing to show. A failed refresh keeps the last answer.
//   retrying    a retry is in flight.
export default function useBehaviorOverview() {
  const query = useQuery({ queryKey: queryKeys.behavior.overview(), queryFn: behaviorApi.getOverview, staleTime: 0 });

  return {
    overview: query.data,
    isPending: query.isPending,
    loadFailed: query.isError && !query.data,
    retrying: query.isFetching,
    retry: () => query.refetch(),
  };
}
