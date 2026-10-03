import Button from '@shared/components/ui/Button.jsx';
import Card from '@shared/components/ui/Card.jsx';
import { formatMoney } from '@shared/utils/formatMoney.js';
import { CARD_COPY, FALLBACK_CATEGORY, FLOW_LABEL } from './pendingContent.js';
import useSwipeToPark from './useSwipeToPark.js';

// One entry waiting for the person to confirm (Guide 7.4): category and Spent/Received, the items, the total, and two
// actions. onConfirm and onLater come from the stack (9g, 9i); a button without its handler stays disabled,
// so nothing on screen does nothing. busy: a confirm is in flight, so Confirm shows its spinner and Later waits.
// Tapping the card, or Enter on it, opens the edit sheet (9h) through onEdit.
// Dragging the card far enough, or flicking it, does what Later does (useSwipeToPark).
// gated: the day is gated (Guide 7.7, Step 9l), so Later is disabled and a drag that would park the card springs back
// and calls onGatedSwipe instead.
export default function PendingCard({ entry, onConfirm, onLater, onEdit, busy = false, gated = false, onGatedSwipe }) {
  const { id, flow, categoryName, items, totalAmount } = entry;

  // A tap anywhere on the card edits it, except on its two buttons. Enter or Space on the focused card does the same.
  const handleClick = (event) => {
    if (!event.target.closest('button')) onEdit();
  };
  const handleKeyDown = (event) => {
    if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onEdit();
    }
  };

  const swipe = useSwipeToPark({
    enabled: Boolean(onLater) && !busy,
    onPark: onLater,
    onBlocked: gated ? () => onGatedSwipe?.() : undefined,
  });

  return (
    <Card
      as="article"
      className="home__card"
      data-entry-id={id}
      tabIndex={onEdit ? 0 : undefined}
      aria-label={onEdit ? [CARD_COPY.edit, categoryName || FALLBACK_CATEGORY, formatMoney(totalAmount)].join(', ') : undefined}
      onClick={onEdit ? handleClick : undefined}
      onKeyDown={onEdit ? handleKeyDown : undefined}
      {...swipe}
    >
      <p className="home__card-meta">
        {categoryName || FALLBACK_CATEGORY} · {FLOW_LABEL[flow]}
      </p>
      <ul className="home__card-rows">
        {items.map((item, index) => (
          <li key={index}>
            <span>{item.description}</span>
            <span>{formatMoney(item.amount)}</span>
          </li>
        ))}
      </ul>
      <div className="home__card-total">
        <span>{CARD_COPY.total}</span>
        <span>{formatMoney(totalAmount)}</span>
      </div>
      <div className="home__card-actions">
        <Button variant="ghost" disabled={!onLater || busy || gated} onClick={onLater}>
          {CARD_COPY.later}
        </Button>
        <Button busy={busy} disabled={!onConfirm} onClick={onConfirm}>
          {CARD_COPY.confirm}
        </Button>
      </div>
    </Card>
  );
}
