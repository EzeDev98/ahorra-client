import { useState } from 'react';
import { Row, Sample, Section } from '../Section.jsx';
import AmountField from '@shared/components/ui/AmountField.jsx';
import ChipSelect from '@shared/components/ui/ChipSelect.jsx';
import Checkbox from '@shared/components/ui/Checkbox.jsx';
import FormError from '@shared/components/ui/FormError.jsx';
import FormField from '@shared/components/ui/FormField.jsx';
import OtpField from '@shared/components/ui/OtpField.jsx';
import PasswordField from '@shared/components/ui/PasswordField.jsx';
import Radio from '@shared/components/ui/Radio.jsx';
import SelectField from '@shared/components/ui/SelectField.jsx';
import TextField from '@shared/components/ui/TextField.jsx';

const PERIODS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function FormsSection() {
  const [name, setName] = useState('Ada');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [period, setPeriod] = useState('');
  const [amount, setAmount] = useState('1500000.5');
  const [remember, setRemember] = useState(true);
  const [choice, setChoice] = useState('monthly');
  const [chip, setChip] = useState('MONTHLY');

  return (
    <Section
      title="2b. Form controls"
      note="Click into each field to see the ring on the box (never doubled). Type 123456 in the code field for success; any other six digits shows the error."
    >
      <div className="gallery__grid">
        <Sample label="TextField with label and hint">
          <FormField label="First name" hint="As on your ID.">
            <TextField value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" />
          </FormField>
        </Sample>
        <Sample label="Optional label">
          <FormField label="Middle name" optional>
            <TextField placeholder="Middle name" />
          </FormField>
        </Sample>
        <Sample label="Error (replaces the hint, same height)">
          <FormField label="Username" hint="Letters and numbers." error="That username is taken.">
            <TextField defaultValue="ada" />
          </FormField>
        </Sample>
        <Sample label="Disabled">
          <FormField label="Phone number">
            <TextField defaultValue="08012345678" disabled />
          </FormField>
        </Sample>
        <Sample label="PasswordField">
          <FormField label="Password" hint="At least 8 characters.">
            <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </FormField>
        </Sample>
        <Sample label="PasswordField, error">
          <FormField label="Confirm password" error="Passwords do not match.">
            <PasswordField defaultValue="abc" autoComplete="new-password" />
          </FormField>
        </Sample>
        <Sample label="OtpField (paste six digits, Backspace, arrow keys)" wide>
          <FormField label="Verification code" error={codeError ? 'That code is not right.' : undefined}>
            <OtpField
              value={code}
              onChange={(next) => {
                setCode(next);
                setCodeError(false);
              }}
              onComplete={(done) => setCodeError(done !== '123456')}
            />
          </FormField>
        </Sample>
        <Sample label="OtpField, disabled">
          <FormField label="Verification code">
            <OtpField value="123" onChange={() => {}} disabled />
          </FormField>
        </Sample>
        <Sample label="SelectField with placeholder">
          <FormField label="Income period">
            <SelectField value={period} onChange={(e) => setPeriod(e.target.value)} options={PERIODS} placeholder="Choose a period" />
          </FormField>
        </Sample>
        <Sample label="SelectField, error">
          <FormField label="Income period" error="Choose a period.">
            <SelectField value="" onChange={() => {}} options={PERIODS} placeholder="Choose a period" />
          </FormField>
        </Sample>
        <Sample label="SelectField, disabled">
          <FormField label="Income period">
            <SelectField value="monthly" onChange={() => {}} options={PERIODS} disabled />
          </FormField>
        </Sample>
        <Sample label="AmountField (commas appear when not focused)">
          <FormField label="Minimum income" hint="Per period.">
            <AmountField value={amount} onChange={setAmount} />
          </FormField>
        </Sample>
        <Sample label="AmountField, error">
          <FormField label="Maximum income" error="Maximum cannot be below the minimum.">
            <AmountField value="500" onChange={() => {}} />
          </FormField>
        </Sample>
        <Sample label="AmountField, disabled">
          <FormField label="Amount">
            <AmountField value="2300" onChange={() => {}} disabled />
          </FormField>
        </Sample>
        <Sample label="Checkbox (used wherever a switch would go)">
          <div className="gallery__stack">
            <Checkbox label="Lock the app with a PIN" hint="Asks for your PIN each time you open Ahorra." checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <Checkbox label="Unchecked" />
            <Checkbox label="Disabled" disabled />
            <Checkbox label="Disabled, checked" disabled defaultChecked />
          </div>
        </Sample>
        <Sample label="Radio (the only round shape)">
          <div className="gallery__stack">
            {PERIODS.map((option) => (
              <Radio
                key={option.value}
                name="gallery-period"
                label={option.label}
                checked={choice === option.value}
                onChange={() => setChoice(option.value)}
              />
            ))}
            <Radio name="gallery-period-disabled" label="Disabled" disabled />
          </div>
        </Sample>
        <Sample label="ChipSelect (single choice; selected is filled)">
          <FormField label="Income period">
            <ChipSelect
              name="gallery-chip"
              value={chip}
              onChange={setChip}
              options={[
                { value: 'DAILY', label: 'Daily' },
                { value: 'WEEKLY', label: 'Weekly' },
                { value: 'MONTHLY', label: 'Monthly' },
                { value: 'CUSTOM', label: 'Custom' },
              ]}
            />
          </FormField>
        </Sample>
        <Sample label="FormError on its own (form-level)">
          <Row><FormError>Could not reach the server. Try again.</FormError></Row>
        </Sample>
      </div>
    </Section>
  );
}
