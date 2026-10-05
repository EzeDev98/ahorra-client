import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@core/data/queryKeys.js';
import { obligationsApi } from '@features/setup/api/obligationsApi.js';
import ObligationsForm from '@features/setup/obligations/ObligationsForm.jsx';
import LoadingScreen from '@shared/components/feedback/LoadingScreen.jsx';
import SomethingWentWrong from '@shared/components/feedback/SomethingWentWrong.jsx';

// Route "/settings/obligations". The same fixed-obligations form as first-run setup, reached later from Settings so a
// bill can be added, changed or removed at any time. Saving returns to Settings; the Plan on Insights re-reads on its next visit.
// backTo: Settings. Passed in so this file holds no path.
export default function SettingsObligations({ backTo }) {
  const { data, isPending, isLoadingError, refetch } = useQuery({
    queryKey: queryKeys.obligations.list(),
    queryFn: obligationsApi.list,
  });

  if (isPending) return <LoadingScreen page />;
  if (isLoadingError) return <SomethingWentWrong onRetry={() => refetch()} />;
  return <ObligationsForm initial={data} backTo={backTo} nextTo={backTo} inSettings />;
}
