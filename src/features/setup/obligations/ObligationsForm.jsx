import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { ApiError } from '@core/http/httpClient.js';
import { queryKeys } from '@core/data/queryKeys.js';
import { flip, run } from '@core/motion/motion.js';
import { obligationsApi } from '@features/setup/api/obligationsApi.js';
import { SETUP_STEP_COUNT } from '@features/setup/setupSteps.js';
import FormScreen from '@shared/components/layout/FormScreen.jsx';
import StepIndicator from '@shared/components/layout/StepIndicator.jsx';
import Button from '@shared/components/ui/Button.jsx';
import FormError from '@shared/components/ui/FormError.jsx';
import './obligations.css';
import ObligationRow from './ObligationRow.jsx';
import { GENERIC_ERROR, LABELS, OBLIGATIONS, OTHER_LABEL } from './obligationsContent.js';
import { SUGGESTIONS, newRow, rowsFromObligations, validateRows } from './obligationsRules.js';
import { syncObligations } from './obligationsSync.js';

// How far a new row slides in, in pixels. Same as the other screens; reduced motion keeps a fade.
const SLIDE_PX = 16;

// The form behind "/setup/obligations". It works on a draft and saves everything when the person continues.
// initial: the obligations the server already has (empty on a first visit).
// backTo: the income screen. nextTo: where Continue leads. Passed in so this file holds no path.
export default function ObligationsForm({ initial, backTo, nextTo }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const suggestionsId = useId();
  const [rows, setRows] = useState(() => rowsFromObligations(initial));
  const [removedIds, setRemovedIds] = useState([]); // saved bills the person removed; deleted on Continue
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [focusTick, setFocusTick] = useState(0);

  const stage = useRef(null);
  const list = useRef(null);
  const justAdded = useRef(null);
  const leaving = useRef(new Set());

  // A new row slides in and takes focus: its amount, or its name for an "Other" bill.
  useLayoutEffect(() => {
    const key = justAdded.current;
    if (!key) return;
    justAdded.current = null;
    const item = list.current?.querySelector(`[data-key="${key}"]`);
    if (!item) return;
    run(item, [{ opacity: 0, transform: `translateY(${-SLIDE_PX}px)` }, { opacity: 1, transform: 'none' }]);
    item.querySelector('input:not([type="radio"])')?.focus();
  }, [rows]);

  // After a failed attempt, move focus to the first field that is wrong.
  useEffect(() => {
    if (focusTick) stage.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [focusTick]);

  const addRow = (name) => {
    if (busy) return;
    const row = newRow(name);
    justAdded.current = row.key;
    setRows((current) => [...current, row]);
  };

  // Changing a field clears that field's error.
  const changeRow = (key, patch) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current[key] };
      Object.keys(patch).forEach((field) => delete next[field]);
      return { ...current, [key]: next };
    });
    setFormError(null);
  };

  // The row fades out, then the ones below glide up into its place.
  const removeRow = async (row, item) => {
    if (busy || leaving.current.has(row.key)) return;
    leaving.current.add(row.key);
    await run(item, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.97)' }], {
      duration: 'fast',
      ease: 'standard',
      fill: 'forwards',
    });
    flip(list.current, () =>
      flushSync(() => {
        setRows((current) => current.filter((entry) => entry.key !== row.key));
        if (row.id) setRemovedIds((current) => [...current, row.id]);
      }),
    );
    leaving.current.delete(row.key);
  };

  const submit = async () => {
    if (busy) return;
    const found = validateRows(rows);
    if (Object.keys(found).length) {
      setErrors(found);
      setFocusTick((tick) => tick + 1);
      return;
    }

    setErrors({});
    setFormError(null);
    setBusy(true);
    try {
      const saved = await syncObligations({
        rows,
        removedIds,
        api: obligationsApi,
        onRemoved: (id) => setRemovedIds((current) => current.filter((entry) => entry !== id)),
        onSaved: (key, patch) => setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row))),
      });
      // Coming back to this screen starts from what was just saved.
      queryClient.setQueryData(queryKeys.obligations.list(), saved);
      navigate(nextTo);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : GENERIC_ERROR);
      setBusy(false);
    }
  };

  const available = SUGGESTIONS.filter((name) => !rows.some((row) => row.preset && row.name === name));
  const nothing = rows.length === 0 && removedIds.length === 0;

  return (
    <div ref={stage}>
      <FormScreen
        title={OBLIGATIONS.title}
        description={OBLIGATIONS.description}
        step={<StepIndicator current={2} total={SETUP_STEP_COUNT} />}
        onBack={() => navigate(backTo)}
        onSubmit={submit}
        footer={
          <>
            <FormError>{formError}</FormError>
            <Button type="submit" block busy={busy}>
              {nothing ? 'Skip for now' : 'Continue'}
            </Button>
          </>
        }
      >
        <div className="obligations__section">
          <p id={suggestionsId} className="obligations__label">
            {LABELS.suggestions}
          </p>
          <div role="group" aria-labelledby={suggestionsId} className="obligations__chips">
            {available.map((name) => (
              <Button key={name} variant="secondary" className="obligations__chip" disabled={busy} onClick={() => addRow(name)}>
                <Plus aria-hidden="true" focusable="false" />
                {name}
              </Button>
            ))}
            <Button variant="secondary" className="obligations__chip" disabled={busy} onClick={() => addRow('')}>
              <Plus aria-hidden="true" focusable="false" />
              {OTHER_LABEL}
            </Button>
          </div>
        </div>

        {rows.length > 0 && (
          <div className="obligations__section">
            <p className="obligations__label">{LABELS.list}</p>
            <ul ref={list} className="obligations__list">
              {rows.map((row) => (
                <ObligationRow
                  key={row.key}
                  row={row}
                  errors={errors[row.key]}
                  disabled={busy}
                  onChange={changeRow}
                  onRemove={removeRow}
                />
              ))}
            </ul>
          </div>
        )}
      </FormScreen>
    </div>
  );
}
