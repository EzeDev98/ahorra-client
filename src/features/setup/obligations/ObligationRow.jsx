import { X } from 'lucide-react';
import AmountField from '@shared/components/ui/AmountField.jsx';
import Card from '@shared/components/ui/Card.jsx';
import ChipSelect from '@shared/components/ui/ChipSelect.jsx';
import FormField from '@shared/components/ui/FormField.jsx';
import IconButton from '@shared/components/ui/IconButton.jsx';
import TextField from '@shared/components/ui/TextField.jsx';
import { HINTS, LABELS, OTHER_LABEL } from './obligationsContent.js';
import { CADENCES, MAX_NAME_LENGTH } from './obligationsRules.js';

// One bill in the list. A bill added from a suggestion shows its name as the title; an "Other" bill asks for one.
// onChange(rowKey, patch) changes some fields. onRemove(row, listItemElement) lets the form animate the row out first.
export default function ObligationRow({ row, errors = {}, disabled = false, onChange, onRemove }) {
  const title = row.name.trim() || OTHER_LABEL;

  return (
    <Card as="li" data-key={row.key}>
      <div role="group" aria-label={title} className="obligation__body">
        <div className="obligation__head">
          <p className="obligation__name">{title}</p>
          <IconButton
            icon={X}
            label={`Remove ${title}`}
            disabled={disabled}
            onClick={(event) => onRemove(row, event.currentTarget.closest('li'))}
          />
        </div>

        {!row.preset && (
          <FormField label={LABELS.name} hint={HINTS.name} error={errors.name}>
            <TextField
              value={row.name}
              maxLength={MAX_NAME_LENGTH}
              autoComplete="off"
              onChange={(event) => onChange(row.key, { name: event.target.value })}
            />
          </FormField>
        )}

        <FormField label={LABELS.amount} error={errors.amount}>
          <AmountField value={row.amount} onChange={(next) => onChange(row.key, { amount: next })} />
        </FormField>

        <FormField label={LABELS.cadence}>
          <ChipSelect
            name={`cadence-${row.key}`}
            options={CADENCES}
            value={row.cadence}
            onChange={(next) => onChange(row.key, { cadence: next })}
          />
        </FormField>
      </div>
    </Card>
  );
}
