import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@core/data/queryKeys.js';
import { spendingPlanApi } from './api/spendingPlanApi.js';

// GET /plan: the 50/30/20 plan for the current income period (Step 19). staleTime 0 re-checks at every visit, since
// confirming an entry or changing an obligation moves the figures.
//   plan  the response, or undefined until the first answer, or when it could not be loaded. The Plan section simply
//         stays out then: the rest of Insights does not depend on it.
export default function usePlan() {
  const query = useQuery({ queryKey: queryKeys.plan.current(), queryFn: spendingPlanApi.get, staleTime: 0 });
  return { plan: query.data };
}
