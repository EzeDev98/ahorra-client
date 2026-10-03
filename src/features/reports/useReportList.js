import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@core/data/queryKeys.js';
import { reportApi } from './api/reportApi.js';

// GET /report/daily: the last 30 days of report summaries, newest first. The last answer shows at once and refreshes
// quietly, so the list never blinks to a spinner on a return visit.
//   reports     the list, or undefined until the first answer.
//   isPending   no answer yet: show the spinner (never use a background refresh for it).
//   loadFailed  true only when there is nothing to show: the first load failed. A failed refresh keeps the last list.
//   retrying    a retry is in flight.
export default function useReportList() {
  const query = useQuery({ queryKey: queryKeys.report.list(), queryFn: () => reportApi.listDaily() });

  return {
    reports: query.data,
    isPending: query.isPending,
    loadFailed: query.isError && !query.data,
    retrying: query.isFetching,
    retry: () => query.refetch(),
  };
}
