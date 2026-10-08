// All pending-card copy lives here, so changing a word never means touching the component.
export const FLOW_LABEL = { EXPENSE: 'Spent', INCOME: 'Received' };

// Shown when the server could not choose a category.
export const FALLBACK_CATEGORY = 'Other';

export const CARD_COPY = {
  total: 'Total',
  later: 'Later',
  confirm: 'Confirm',
  edit: 'Edit',
  hint: 'Tap the card to edit or discard',
};

export const STACK_COPY = {
  loadFailed: 'Could not load your pending entries.',
  retry: 'Try again',
};

export const CONFIRM_COPY = {
  failed: 'Could not confirm. Try again.',
};

// The bell's accessible name. The badge itself is hidden from screen readers, so this says the count.
export const BELL_LABEL = {
  empty: 'Nothing waiting',
  waiting: (count) => (count === 1 ? '1 entry waiting' : `${count} entries waiting`),
};

export const DISCARD_COPY = {
  discarded: 'Entry discarded',
  undo: 'Undo',
  failed: 'Could not discard. Try again.',
  restoreFailed: 'Could not bring the entry back.',
};
