import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@core/http/httpClient.js';
import { queryKeys } from '@core/data/queryKeys.js';
import { useToast } from '@shared/components/ui/toastContext.js';
import { entriesApi } from './api/entriesApi.js';
import { CONFIRM_COPY } from './pendingContent.js';

// Confirms one pending entry as the server parsed it (POST /entries/pending/{id}/confirm, no body). Returns
//   confirm(entry, leave, { edits, onError }) -> Promise<boolean>   true when the entry was confirmed.
// edits is the optional confirm body from the edit sheet (Step 9h). onError(message), when given, receives the failure
// text instead of a toast, so the sheet can show it where the person is looking.
// leave is an optional function that runs once the server has said yes and before the entry leaves the list: the
// stack passes the card's exit animation, so the card is only removed after it has finished (Guide 7.4).
// What a failure does:
//   - 423 (the day is gated), 404 or 409 (the entry is already gone or already confirmed, for example from another
//     device): not an error to show. The list and gate state are refreshed so the screen tells the truth.
//   - anything else (no connection, a server error): a toast; the card stays and the person can tap again.
export default function useConfirmEntry() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return async function confirm(entry, leave, { edits, onError } = {}) {
    try {
      await entriesApi.confirm(entry.id, edits);
    } catch (error) {
      if (error instanceof ApiError && (error.isGated || error.isNotFound || error.isConflict)) {
        queryClient.invalidateQueries({ queryKey: queryKeys.day.status() });
      } else if (onError) {
        onError(error instanceof ApiError && error.status === 400 ? error.message : CONFIRM_COPY.failed);
      } else {
        toast.show(CONFIRM_COPY.failed, { tone: 'error' });
      }
      return false;
    }

    await leave?.();

    // Take the entry out of the cached list at once, then ask for the real answer: confirming can lift the day gate,
    // and it changes what the reports and the behaviour overview say.
    queryClient.setQueryData(queryKeys.day.status(), (status) =>
      status && { ...status, pending: status.pending.filter((item) => String(item.id) !== String(entry.id)) },
    );
    queryClient.invalidateQueries({ queryKey: queryKeys.day.status() });
    queryClient.invalidateQueries({ queryKey: queryKeys.entries.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.report.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.behavior.all });
    return true;
  };
}
