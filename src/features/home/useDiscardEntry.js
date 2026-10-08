import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@core/http/httpClient.js';
import { queryKeys } from '@core/data/queryKeys.js';
import { useToast } from '@shared/components/ui/toastContext.js';
import { entriesApi } from './api/entriesApi.js';
import { DISCARD_COPY } from './pendingContent.js';

// How long the Undo button stays on the toast.
const UNDO_MS = 6000;

// Throws one pending entry away (POST /entries/pending/{id}/discard) and offers an Undo (POST .../restore). Returns
//   discard(entry, leave, { onError }) -> Promise<boolean>   true when the entry was discarded.
// It follows the same rules as useConfirmEntry: leave runs once the server has said yes and before the entry leaves the
// list (the card's exit animation); onError(message), when given, gets the failure text instead of a toast.
// What a failure does:
//   - 404 (already gone), 409, 423: not an error to show. The list and gate state are refreshed so the screen tells the truth.
//   - 400 (the entry was confirmed meanwhile): the server's message goes to onError.
//   - anything else (no connection, a server error): a toast, or onError; the card stays and the person can try again.
// Discarding works while the day is gated: it is how a wrong entry stops blocking the day.
export default function useDiscardEntry() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Discarding changes the queue, the gate and today's running total; the behaviour overview only counts confirmed entries.
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.day.status() });
    queryClient.invalidateQueries({ queryKey: queryKeys.entries.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.report.all });
  };

  const undo = async (entry) => {
    try {
      await entriesApi.restore(entry.id);
    } catch {
      toast.show(DISCARD_COPY.restoreFailed, { tone: 'error' });
      return;
    }
    refresh(); // the entry comes back through the refreshed list and slides in like any new card
  };

  return async function discard(entry, leave, { onError } = {}) {
    try {
      await entriesApi.discard(entry.id);
    } catch (error) {
      if (error instanceof ApiError && (error.isGated || error.isNotFound || error.isConflict)) {
        queryClient.invalidateQueries({ queryKey: queryKeys.day.status() });
      } else {
        const message = error instanceof ApiError && error.status === 400 ? error.message : DISCARD_COPY.failed;
        if (onError) onError(message);
        else toast.show(message, { tone: 'error' });
      }
      return false;
    }

    await leave?.();

    queryClient.setQueryData(queryKeys.day.status(), (status) =>
      status && { ...status, pending: status.pending.filter((item) => String(item.id) !== String(entry.id)) },
    );
    refresh();
    toast.show(DISCARD_COPY.discarded, { action: { label: DISCARD_COPY.undo, onClick: () => undo(entry) }, duration: UNDO_MS });
    return true;
  };
}
