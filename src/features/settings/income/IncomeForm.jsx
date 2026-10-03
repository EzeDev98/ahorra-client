import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@core/http/httpClient.js';
import { queryKeys } from '@core/data/queryKeys.js';
import { run } from '@core/motion/motion.js';
import { incomeApi } from '@features/setup/api/incomeApi.js';
import { GENERIC_ERROR, HINTS, LABELS } from '@features/setup/income/incomeContent.js';
import { PERIODS, periodNoun, toRequestBody, valuesFromIncome, validateIncome } from '@features/setup/income/incomeRules.js';
import AmountField from '@shared/components/ui/AmountField.jsx';
import Button from '@shared/components/ui/Button.jsx';
import ChipSelect from '@shared/components/ui/ChipSelect.jsx';
import FormError from '@shared/components/ui/FormError.jsx';
import FormField from '@shared/components/ui/FormField.jsx';
import TextField from '@shared/components/ui/TextField.jsx';
import { useToast } from '@shared/components/ui/toastContext.js';
import { INCOME_SETTINGS } from './settingsIncomeContent.js';

// How far the custom-length field slides in, in pixels. Same as the setup screen; reduced motion keeps a fade.
const SLIDE_PX = 16;

// True when the form holds something other than what is saved.
function differs(body, current) {
  if (!current) return true;
  return (
    body.minAmount !== Number(current.minAmount) ||
    body.maxAmount !== Number(current.maxAmount) ||
    body.periodType !== current.periodType ||
    (body.periodType === 'CUSTOM' && body.periodLength !== current.periodLength)
  );
}

// The same fields and rules as first-run setup (Step 7a), starting from the saved income. Save is off until something
// changes. Saving calls PUT /income, which closes the old record and starts a new one; the result is written into the
// income.current query before anything else, so the setup guard never sees a gap. Everything derived from the old
// income is marked stale: the history, the reports, the insights and the behaviour figures.
// current: the saved income, or null.
export default function IncomeForm({ current }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [values, setValues] = useState(() => valuesFromIncome(current));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [focusTick, setFocusTick] = useState(0);

  const form = useRef(null);
  const lengthField = useRef(null);
  const custom = values.periodType === 'CUSTOM';
  const noun = periodNoun(values.periodType);
  const dirty = differs(toRequestBody(values), current);

  // The length field arrives with a short slide and fade, before it is first painted.
  useLayoutEffect(() => {
    if (!custom || !lengthField.current) return;
    run(lengthField.current, [{ opacity: 0, transform: `translateY(${-SLIDE_PX}px)` }, { opacity: 1, transform: 'none' }]);
  }, [custom]);

  // After a failed attempt, move focus to the first field that is wrong.
  useEffect(() => {
    if (focusTick) form.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [focusTick]);

  // Changing a field clears that field's error. Changing the period also clears a stale length error.
  const setField = (name, value) => {
    setValues((existing) => ({ ...existing, [name]: value }));
    setErrors((existing) => ({ ...existing, [name]: undefined, ...(name === 'periodType' ? { periodLength: undefined } : {}) }));
    setFormError(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy || !dirty) return;
    const found = validateIncome(values);
    if (Object.keys(found).length) {
      setErrors(found);
      setFocusTick((tick) => tick + 1);
      return;
    }

    setErrors({});
    setFormError(null);
    setBusy(true);
    try {
      const income = await incomeApi.set(toRequestBody(values));
      queryClient.setQueryData(queryKeys.income.current(), income);
      queryClient.invalidateQueries({ queryKey: queryKeys.income.all, predicate: (query) => query.queryKey[1] !== 'current' });
      queryClient.invalidateQueries({ queryKey: queryKeys.report.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.behavior.all });
      toast.show(INCOME_SETTINGS.saved, { tone: 'success' });
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : GENERIC_ERROR);
    }
    setBusy(false);
  };

  return (
    <form ref={form} className="settings-income__form" noValidate onSubmit={submit}>
      <FormField label={LABELS.period}>
        <ChipSelect
          name="settings-income-period"
          options={PERIODS}
          value={values.periodType}
          onChange={(next) => setField('periodType', next)}
        />
      </FormField>

      {custom && (
        <div ref={lengthField}>
          <FormField label={LABELS.periodLength} hint={HINTS.periodLength} error={errors.periodLength}>
            <TextField
              inputMode="numeric"
              autoComplete="off"
              value={values.periodLength}
              onChange={(event) => setField('periodLength', event.target.value.replace(/\D/g, ''))}
            />
          </FormField>
        </div>
      )}

      <FormField label={LABELS.minAmount} hint={HINTS.minAmount(noun)} error={errors.minAmount}>
        <AmountField value={values.minAmount} onChange={(next) => setField('minAmount', next)} />
      </FormField>

      <FormField label={LABELS.maxAmount} hint={HINTS.maxAmount(noun)} error={errors.maxAmount}>
        <AmountField value={values.maxAmount} onChange={(next) => setField('maxAmount', next)} />
      </FormField>

      <FormError>{formError}</FormError>
      <Button type="submit" busy={busy} disabled={!dirty}>
        {INCOME_SETTINGS.save}
      </Button>
    </form>
  );
}
