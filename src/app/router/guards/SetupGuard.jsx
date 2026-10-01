import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router';
import { queryKeys } from '@core/data/queryKeys.js';
import { incomeApi } from '@features/setup/api/incomeApi.js';
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

  if (isPending) return <LoadingScreen page />;
  if (isLoadingError) return <SomethingWentWrong onRetry={() => refetch()} />;
  if (data === null) return <Navigate to={redirectTo} replace />;
  return setupStatus.isComplete() ? children : <Navigate to={incompleteTo} replace />;
}
