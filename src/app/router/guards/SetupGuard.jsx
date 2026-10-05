import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router';
import { queryKeys } from '@core/data/queryKeys.js';
import { incomeApi } from '@features/setup/api/incomeApi.js';
import { obligationsApi } from '@features/setup/api/obligationsApi.js';
import { setupStatus } from '@features/setup/setupStatus.js';
import LoadingScreen from '@shared/components/feedback/LoadingScreen.jsx';
import SomethingWentWrong from '@shared/components/feedback/SomethingWentWrong.jsx';

// Wraps a route that needs first-run setup finished: a signed-in person with no income set goes to the income setup.
// The income is read once and kept (queryKeys.income.current), so later screens pass without waiting.
// Whatever saves the income (Step 7a, 11b) must write the result into that same query before it navigates on.
// A failed read is a failure, not "no income": it shows the error screen with a retry, never the setup.
// A person with income set who has not finished setup on this device (setupStatus) goes to the fixed-obligations step to resume it.
// redirectTo: the income setup path. incompleteTo: the fixed-obligations path. Passed in so this file holds no path.
export default function SetupGuard({ redirectTo, incompleteTo, children }) {
  const { data, isPending, isLoadingError, refetch } = useQuery({
    queryKey: queryKeys.income.current(),
    queryFn: incomeApi.get,
  });

  const complete = setupStatus.isComplete();
  // Setup is only remembered on this device. When it is not, the server says whether the obligations were set before.
  const obligations = useQuery({
    queryKey: queryKeys.obligations.list(),
    queryFn: obligationsApi.list,
    enabled: !complete && data !== undefined && data !== null,
  });

  if (isPending) return <LoadingScreen page />;
  if (isLoadingError) return <SomethingWentWrong onRetry={() => refetch()} />;
  if (data === null) return <Navigate to={redirectTo} replace />;
  if (complete) return children;
  if (obligations.isPending) return <LoadingScreen page />;
  if (obligations.isLoadingError) return <SomethingWentWrong onRetry={() => obligations.refetch()} />;
  if (obligations.data.length > 0) {
    setupStatus.markComplete(); // already set on the server: remember it here and skip the setup screen
    return children;
  }
  return <Navigate to={incompleteTo} replace />;
}
