import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@core/data/queryKeys.js';
import { reportApi } from '@features/reports/api/reportApi.js';

// GET /report/ambient: today's running figures for the side panel. It only asks while the panel is open (enabled), and
// asks again at every opening (staleTime 0) while showing the last answer at once. The server answers 423 while the day
// is gated, so the panel passes enabled: false then and never makes that request.
//   ambient  the response, or undefined until the first answer.
//   failed   true only when there is nothing to show: the first load failed. A failed refresh keeps the last figures.
export default function useAmbient({ enabled }) {
  const query = useQuery({ queryKey: queryKeys.report.ambient(), queryFn: reportApi.getAmbient, staleTime: 0, enabled });

  return {
    ambient: query.data,
    failed: query.isError && !query.data,
    retry: () => query.refetch(),
  };
}
