import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@core/data/queryKeys.js';
import { obligationsApi } from '@features/setup/api/obligationsApi.js';
import LoadingScreen from '@shared/components/feedback/LoadingScreen.jsx';
import SomethingWentWrong from '@shared/components/feedback/SomethingWentWrong.jsx';
import ObligationsForm from './ObligationsForm.jsx';

// Route "/setup/obligations". Step 2 of 2 of first-run setup. It reads what the server (or, for now, the stand-in)
// already holds, then hands it to the form, so coming back from the next screen shows what was saved.
// backTo: the income screen. nextTo: where Continue leads. Passed in so this file holds no path.
export default function SetupObligations({ backTo, nextTo }) {
  const { data, isPending, isLoadingError, refetch } = useQuery({
    queryKey: queryKeys.obligations.list(),
    queryFn: obligationsApi.list,
  });

  if (isPending) return <LoadingScreen page />;
  if (isLoadingError) return <SomethingWentWrong onRetry={() => refetch()} />;
  return <ObligationsForm initial={data} backTo={backTo} nextTo={nextTo} />;
}
