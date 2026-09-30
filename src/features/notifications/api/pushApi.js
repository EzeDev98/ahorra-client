import { httpClient } from '@core/http/httpClient.js';
import { isStandIn } from '@core/http/standIn.js';
import { pushStandIn } from './pushStandIn.js';

// CONTRACT [PROPOSED, for plan S3]. The server has no endpoint yet; the stand-in answers until 'push'
// is removed from VITE_STAND_INS.

const real = {
  // POST /push/subscriptions
  // in:  { endpoint, keys: { p256dh, auth } }   (the browser's PushSubscription.toJSON())
  // out: nothing (204)
  subscribe: ({ endpoint, keys }) => httpClient.post('/push/subscriptions', { endpoint, keys }),

  // DELETE /push/subscriptions?endpoint=
  // out: nothing (204)
  unsubscribe: (endpoint) => httpClient.delete('/push/subscriptions', { params: { endpoint } }),
};

export const pushApi = isStandIn('push') ? pushStandIn : real;
