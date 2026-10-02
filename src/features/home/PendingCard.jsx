import Button from '@shared/components/ui/Button.jsx';
import Card from '@shared/components/ui/Card.jsx';
import { formatMoney } from '@shared/utils/formatMoney.js';
import { CARD_COPY, FALLBACK_CATEGORY, FLOW_LABEL } from './pendingContent.js';

// One entry waiting for the person to confirm (Guide 7.4): category and Spent/Received, the items, the total, and two
// actions. onConfirm and onLater come from the stack in Steps 9g and 9i; a button without its handler stays disabled,
// so nothing on screen does nothing. The edit sheet (tap the card) is Step 9h.
export default function PendingCard({ entry, onConfirm, onLater }) {
  const { id, flow, categoryName, items, totalAmount } = entry;

  return (
    <Card as="article" className="home__card" data-entry-id={id}>
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
        <Button variant="ghost" disabled={!onLater} onClick={onLater}>
          {CARD_COPY.later}
        </Button>
        <Button disabled={!onConfirm} onClick={onConfirm}>
          {CARD_COPY.confirm}
        </Button>
      </div>
    </Card>
  );
}
