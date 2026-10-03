import { useEffect, useId, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import './EditEntrySheet.css';
import AmountField from '@shared/components/ui/AmountField.jsx';
import BottomSheet from '@shared/components/ui/BottomSheet.jsx';
import Button from '@shared/components/ui/Button.jsx';
import ChipSelect from '@shared/components/ui/ChipSelect.jsx';
import FormError from '@shared/components/ui/FormError.jsx';
import FormField from '@shared/components/ui/FormField.jsx';
import IconButton from '@shared/components/ui/IconButton.jsx';
import SelectField from '@shared/components/ui/SelectField.jsx';
import TextField from '@shared/components/ui/TextField.jsx';
import { formatMoney } from '@shared/utils/formatMoney.js';
import { ERRORS, FLOW_OPTIONS, LABELS, MAX_ITEMS, SHEET, VENDOR_MAX } from './editEntryContent.js';
import { draftTotal, toDraft, toEdits, validateDraft } from './editEntryRules.js';
import useCategories from './useCategories.js';

// The edit sheet (Guide 7.4): Spent or Received, vendor, date, and the items with their amounts. Confirm sends only what
// changed, as the confirm body, or no body at all when nothing changed. The category can be changed from the user's own
// list (Step 17); the account is not editable here until accounts have a lookup too (Guide 8.1).
// entry: the pending entry being edited. open/onClose: the sheet's visibility. busy: a confirm for this entry is in flight.
// onConfirm(edits, onError) -> Promise<boolean>: the stack confirms and, on a server complaint, calls onError(message).
// Give it a new `key` each time it opens, so the form starts from the entry again.
export default function EditEntrySheet({ entry, open, onClose, onConfirm, busy }) {
  const formId = useId();
  const form = useRef(null);
  const [draft, setDraft] = useState(() => toDraft(entry));
  const [errors, setErrors] = useState(null);
  const [problem, setProblem] = useState('');
  const [focusTick, setFocusTick] = useState(0);
  const nextKey = useRef(draft.items.length);
  const { categories } = useCategories();
  // The picker lists the user's categories, plus the entry's current one if it has since been switched off, so it never shows blank.
  const categoryOptions = categories.map((category) => ({ value: String(category.id), label: category.name }));
  if (entry.categoryId != null && !categoryOptions.some((option) => option.value === String(entry.categoryId))) {
    categoryOptions.unshift({ value: String(entry.categoryId), label: entry.categoryName ?? LABELS.category });
  }

  useEffect(() => {
    if (!focusTick) return;
    form.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [focusTick]);

  // Any change clears the messages: they described the text as it was.
  const edit = (change) => {
    setDraft(change);
    setErrors(null);
    setProblem('');
  };

  const setField = (name) => (value) => edit((current) => ({ ...current, [name]: value }));

  const setItem = (key, name) => (value) =>
    edit((current) => ({
      ...current,
      items: current.items.map((item) => (item.key === key ? { ...item, [name]: value } : item)),
    }));

  const addItem = () =>
    edit((current) => ({
      ...current,
      items: [...current.items, { key: nextKey.current++, description: '', amount: '' }],
    }));

  const removeItem = (key) => edit((current) => ({ ...current, items: current.items.filter((item) => item.key !== key) }));

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    const found = validateDraft(draft);
    if (found.hasErrors) {
      setErrors(found);
      setFocusTick((tick) => tick + 1);
      return;
    }
    await onConfirm(toEdits(entry, draft), setProblem);
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      dismissible={!busy}
      title={SHEET.title}
      footer={
        <>
          <Button variant="ghost" disabled={busy} onClick={onClose}>
            {SHEET.cancel}
          </Button>
          <Button type="submit" form={formId} busy={busy}>
            {SHEET.confirm}
          </Button>
        </>
      }
    >
      <form id={formId} ref={form} className="edit-entry" noValidate autoComplete="off" onSubmit={submit}>
        <FormField label={LABELS.flow}>
          <ChipSelect options={FLOW_OPTIONS} value={draft.flow} onChange={setField('flow')} disabled={busy} />
        </FormField>
        <FormField label={LABELS.vendor}>
          <TextField value={draft.vendor} maxLength={VENDOR_MAX} onChange={(event) => setField('vendor')(event.target.value)} />
        </FormField>
        {categoryOptions.length > 0 && (
          <FormField label={LABELS.category}>
            <SelectField
              options={categoryOptions}
              placeholder={LABELS.category}
              value={draft.categoryId}
              onChange={(event) => setField('categoryId')(event.target.value)}
              disabled={busy}
            />
          </FormField>
        )}
        <FormField label={LABELS.date} error={errors?.date ? ERRORS.date : undefined}>
          <TextField type="date" value={draft.entryDate} onChange={(event) => setField('entryDate')(event.target.value)} />
        </FormField>

        <div className="edit-entry__items">
          <p className="edit-entry__heading">{LABELS.items}</p>
          {draft.items.map((item, index) => {
            const problems = errors?.items[index];
            return (
              <div key={item.key} className="edit-entry__item">
                <FormField
                  label={LABELS.item(index + 1)}
                  error={problems?.description ? ERRORS.description : undefined}
                  className="edit-entry__description"
                >
                  <TextField
                    value={item.description}
                    onChange={(event) => setItem(item.key, 'description')(event.target.value)}
                  />
                </FormField>
                <FormField label={LABELS.amount} error={problems?.amount ? ERRORS.amount : undefined}>
                  <AmountField value={item.amount} onChange={setItem(item.key, 'amount')} />
                </FormField>
                {draft.items.length > 1 && (
                  <IconButton icon={Trash2} label={LABELS.removeItem(index + 1)} onClick={() => removeItem(item.key)} />
                )}
              </div>
            );
          })}
          {draft.items.length < MAX_ITEMS && (
            <Button variant="ghost" onClick={addItem}>
              <Plus aria-hidden="true" /> {LABELS.addItem}
            </Button>
          )}
        </div>

        <div className="edit-entry__total">
          <span>{LABELS.total}</span>
          <span>{formatMoney(draftTotal(draft))}</span>
        </div>
        <FormError>{problem}</FormError>
      </form>
    </BottomSheet>
  );
}
