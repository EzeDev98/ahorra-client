import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@core/http/httpClient.js';
import { queryKeys } from '@core/data/queryKeys.js';
import { run } from '@core/motion/motion.js';
import { incomeApi } from '@features/setup/api/incomeApi.js';
import { SETUP_STEP_COUNT } from '@features/setup/setupSteps.js';
import FormScreen from '@shared/components/layout/FormScreen.jsx';
import StepIndicator from '@shared/components/layout/StepIndicator.jsx';
import AmountField from '@shared/components/ui/AmountField.jsx';
import Button from '@shared/components/ui/Button.jsx';
import ChipSelect from '@shared/components/ui/ChipSelect.jsx';
import FormError from '@shared/components/ui/FormError.jsx';
import FormField from '@shared/components/ui/FormField.jsx';
import TextField from '@shared/components/ui/TextField.jsx';
import { GENERIC_ERROR, HINTS, INCOME, LABELS } from './incomeContent.js';
import { PERIODS, periodNoun, toRequestBody, valuesFromIncome, validateIncome } from './incomeRules.js';

// How far the custom-length field slides in, in pixels. Same as the other screens; reduced motion keeps a fade.
const SLIDE_PX = 16;

// Route "/setup/income". Step 1 of 2 of first-run setup: the period, then the lowest and highest income for it.
// The lower bound becomes the baseline Ahorra judges spending against (Guide 2.2).
// There is no Back: before setup there is nowhere meaningful to go back to.
// Coming back from the next screen shows what was saved, and saving again the same day corrects it in place.
// nextTo: the fixed-obligations screen. Passed in so this file holds no path.
export default function SetupIncome({ nextTo }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [values, setValues] = useState(() => valuesFromIncome(queryClient.getQueryData(queryKeys.income.current())));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [focusTick, setFocusTick] = useState(0);

  const stage = useRef(null);
  const lengthField = useRef(null);
  const custom = values.periodType === 'CUSTOM';
  const noun = periodNoun(values.periodType);

  // The length field arrives with a short slide and fade, before it is first painted.
  useLayoutEffect(() => {
    if (!custom || !lengthField.current) return;
    run(lengthField.current, [{ opacity: 0, transform: `translateY(${-SLIDE_PX}px)` }, { opacity: 1, transform: 'none' }]);
  }, [custom]);

  // After a failed attempt, move focus to the first field that is wrong.
  useEffect(() => {
    if (focusTick) stage.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [focusTick]);

  // Changing a field clears that field's error. Changing the period also clears a stale length error.
  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, ...(name === 'periodType' ? { periodLength: undefined } : {}) }));
    setFormError(null);
  };

  const submit = async () => {
    if (busy) return;
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
      // SetupGuard reads this same query, so write the result before moving on: the next screen never waits for it
      // and is never bounced back here. Whatever was derived from the old income is stale now.
      queryClient.setQueryData(queryKeys.income.current(), income);
      queryClient.invalidateQueries({ queryKey: queryKeys.income.all, predicate: (query) => query.queryKey[1] !== 'current' });
      queryClient.invalidateQueries({ queryKey: queryKeys.report.all });
      navigate(nextTo);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : GENERIC_ERROR);
      setBusy(false);
    }
  };

  return (
    <div ref={stage}>
      <FormScreen
        title={INCOME.title}
        description={INCOME.description}
        step={<StepIndicator current={1} total={SETUP_STEP_COUNT} />}
        onSubmit={submit}
        footer={
          <>
            <FormError>{formError}</FormError>
            <Button type="submit" block busy={busy}>
              Continue
            </Button>
          </>
        }
      >
        <FormField label={LABELS.period}>
          <ChipSelect
            name="income-period"
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
      </FormScreen>
    </div>
  );
}
