import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@core/data/queryKeys.js';
import { incomeApi } from '@features/setup/api/incomeApi.js';

// GET /income/history: every income record, newest first (the server sorts it). The last answer shows at once and
// refreshes quietly.
//   history     the list, or undefined until the first answer.
//   isPending   no answer yet: show the spinner.
//   loadFailed  the first load failed, so there is nothing to show.
//   retrying    a retry is in flight.
export default function useIncomeHistory() {
  const query = useQuery({ queryKey: queryKeys.income.history(), queryFn: incomeApi.getHistory });

  return {
    history: query.data,
    isPending: query.isPending,
    loadFailed: query.isError && !query.data,
    retrying: query.isFetching,
    retry: () => query.refetch(),
  };
}
