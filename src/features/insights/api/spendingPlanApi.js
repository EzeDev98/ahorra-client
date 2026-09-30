import { httpClient } from '@core/http/httpClient.js';
import { isStandIn } from '@core/http/standIn.js';
import { spendingPlanStandIn } from './spendingPlanStandIn.js';

// CONTRACT [PROPOSED, for plan S4; where it appears in the client is still open, Guide section 11 item 7].
// The stand-in answers until 'spending-plan' is removed from VITE_STAND_INS.

const real = {
  // GET /spending-plan
  // out: { basis: 'GENERIC' | 'OBSERVED', split: [{ name, percent }] }
  //      GENERIC is the day 1 to 30 heuristic and must be labelled as such; OBSERVED is recalibrated from behaviour after day 30.
  get: () => httpClient.get('/spending-plan'),
};

export const spendingPlanApi = isStandIn('spending-plan') ? spendingPlanStandIn : real;
