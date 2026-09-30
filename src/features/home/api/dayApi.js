import { httpClient } from '@core/http/httpClient.js';

export const dayApi = {
  // GET /day/status
  // out: { gated, reason: 'NONE' | 'SUSPENDED_DAY' | 'HARD_GATE_TODAY', day: 'yyyy-MM-dd', otherDaysRemaining, hardGateTime: 'HH:mm',
  //        pending: PendingEntry[] }
  //      Gated: pending holds only the oldest gated day's entries. Not gated: all pending entries.
  getStatus: () => httpClient.get('/day/status'),
};
