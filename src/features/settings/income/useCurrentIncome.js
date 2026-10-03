import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@core/data/queryKeys.js';
import { incomeApi } from '@features/setup/api/incomeApi.js';

// GET /income, through the same query the setup guard reads (income.current), so saving a change updates both at once.
//   income      the current income, null when none is set, or undefined until the first answer.
//   isPending   no answer yet: show the spinner.
//   loadFailed  the first load failed, so there is nothing to show. A failed refresh keeps the last answer.
//   retrying    a retry is in flight.
export default function useCurrentIncome() {
  const query = useQuery({ queryKey: queryKeys.income.current(), queryFn: incomeApi.get });

  return {
    income: query.data,
    isPending: query.isPending,
    loadFailed: query.isError && query.data === undefined,
    retrying: query.isFetching,
    retry: () => query.refetch(),
  };
}
