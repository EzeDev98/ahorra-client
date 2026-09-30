import { httpClient } from '@core/http/httpClient.js';

// PendingEntry: { id, rawEntryId, status: 'PENDING' | 'CONFIRMED' | 'EDITED', flow: 'EXPENSE' | 'INCOME', entryDate, vendor,
//                 categoryId, categoryName, accountId, accountName, items: [{ description, amount }], totalAmount }

// One fresh id per capture attempt. Sending the same id again returns the entry already created, never a second one.
export const newClientRequestId = () => crypto.randomUUID();

export const entriesApi = {
  // POST /entries/capture
  // in:  { text (required, max 2000), source: 'TEXT' | 'VOICE' (default TEXT), clientRequestId (max 100) }
  // out: PendingEntry. 423 day gated, 400 unreadable or too large.
  capture: ({ text, source = 'TEXT', clientRequestId = newClientRequestId() }) =>
    httpClient.post('/entries/capture', { text, source, clientRequestId }),

  // GET /entries/pending
  // out: PendingEntry[]
  listPending: () => httpClient.get('/entries/pending'),

  // POST /entries/pending/{id}/confirm
  // in:  no body to confirm as parsed, or edits (a missing field is left as is):
  //      { flow?, entryDate?: 'yyyy-MM-dd', vendor? (max 255), categoryId?, accountId?, items?: [{ description, amount }] (max 50) }
  // out: PendingEntry. 423 day gated.
  confirm: (id, edits) => httpClient.post(`/entries/pending/${encodeURIComponent(id)}/confirm`, edits),
};
