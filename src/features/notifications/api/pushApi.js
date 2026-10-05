import { httpClient } from '@core/http/httpClient.js';
import { isStandIn } from '@core/http/standIn.js';
import { pushStandIn } from './pushStandIn.js';

// CONTRACT. The server has these endpoints; the stand-in answers only while 'push' is listed in VITE_STAND_INS.

const real = {
  // POST /push/subscriptions
  // in:  { endpoint, keys: { p256dh, auth } }   (the browser's PushSubscription.toJSON())
  // out: nothing (204)
  subscribe: ({ endpoint, keys }) => httpClient.post('/push/subscriptions', { endpoint, keys }),

  // DELETE /push/subscriptions?endpoint=
  // out: nothing (204)
  unsubscribe: (endpoint) => httpClient.delete('/push/subscriptions', { params: { endpoint } }),

  // GET /push/reminder
  // out: { enabled }   kept on the user, so it survives a reinstall
  getReminder: () => httpClient.get('/push/reminder'),

  // PUT /push/reminder
  // in:  { enabled }
  // out: nothing (204)
  setReminder: (enabled) => httpClient.put('/push/reminder', { enabled }),
};

export const pushApi = isStandIn('push') ? pushStandIn : real;
