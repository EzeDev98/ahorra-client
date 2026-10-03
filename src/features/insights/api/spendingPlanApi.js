import { httpClient } from '@core/http/httpClient.js';

// Plan: {
//   phase: 'STARTER' | 'OBSERVED', planDay, starterDays, periodType, periodStart, periodEnd, daysElapsed, daysInPeriod,
//   basis (the lower bound of the income range), obligationsTotal, obligationsExceedNeeds,
//   buckets: [{ key: 'NEEDS' | 'WANTS' | 'SAVINGS', sharePercent, target, committed, room, observed }]
// }
// observed is null while the phase is STARTER. room is target minus committed and can be negative.
export const spendingPlanApi = {
  // GET /plan
  // out: Plan for the income period that contains today. 404 when no income has been set.
  get: () => httpClient.get('/plan'),
};
