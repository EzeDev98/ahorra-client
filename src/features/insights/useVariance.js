import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@core/data/queryKeys.js';
import { incomeApi } from '@features/setup/api/incomeApi.js';

// GET /income/variance: spend against the income baseline for the current period, with the category breakdown.
// staleTime 0 re-checks at every visit, since confirming an entry changes these figures; the last answer still shows at once.
//   variance    the response, or undefined until the first answer.
//   isPending   no answer yet: show the spinner.
//   notFound    income has not been set (the server answers 404).
//   loadFailed  the load failed for another reason and there is nothing to show.
//   retrying    a retry is in flight.
export default function useVariance() {
  const query = useQuery({ queryKey: queryKeys.income.variance(), queryFn: () => incomeApi.getVariance(), staleTime: 0 });
  const notFound = query.isError && Boolean(query.error?.isNotFound);

  return {
    variance: query.data,
    isPending: query.isPending,
    notFound,
    loadFailed: query.isError && !query.data && !notFound,
    retrying: query.isFetching,
    retry: () => query.refetch(),
  };
}
