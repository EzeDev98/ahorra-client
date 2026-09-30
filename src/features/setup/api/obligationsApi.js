import { httpClient } from '@core/http/httpClient.js';
import { isStandIn } from '@core/http/standIn.js';
import { obligationsStandIn } from './obligationsStandIn.js';

// CONTRACT [PROPOSED, for plan S2]. The server has no endpoint yet; the stand-in answers until 'obligations'
// is removed from VITE_STAND_INS.
// Obligation: { id, name, amount, cadence: 'DAILY' | 'WEEKLY' | 'MONTHLY', active }

const real = {
  // GET /obligations
  // out: Obligation[]
  list: () => httpClient.get('/obligations'),

  // POST /obligations
  // in:  { name, amount > 0, cadence }
  // out: Obligation. 400 validation.
  create: ({ name, amount, cadence }) => httpClient.post('/obligations', { name, amount, cadence }),

  // PUT /obligations/{id}
  // in:  { name, amount > 0, cadence, active }
  // out: Obligation. 404 unknown id.
  update: (id, { name, amount, cadence, active }) =>
    httpClient.put(`/obligations/${encodeURIComponent(id)}`, { name, amount, cadence, active }),

  // DELETE /obligations/{id}
  // out: nothing (204). 404 unknown id.
  remove: (id) => httpClient.delete(`/obligations/${encodeURIComponent(id)}`),
};

export const obligationsApi = isStandIn('obligations') ? obligationsStandIn : real;
