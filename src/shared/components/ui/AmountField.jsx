import { useState } from 'react';
import TextField from './TextField.jsx';

const CURRENCY = '₦';

// Digits and at most one dot, two decimals.
function sanitize(text) {
  const [whole, ...rest] = text.replace(/[^\d.]/g, '').split('.');
  return rest.length === 0 ? whole : `${whole}.${rest.join('').slice(0, 2)}`;
}

// 1500000.5 -> 1,500,000.5
function group(raw) {
  const [whole, decimals] = raw.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimals === undefined ? grouped : `${grouped}.${decimals}`;
}

// value is the raw number as a string ("1500.5"). onChange(nextRawString), not the event.
// Commas show only while the field is not focused, so the caret never jumps while typing.
export default function AmountField({ value = '', onChange, onFocus, onBlur, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <TextField
      {...props}
      inputMode="decimal"
      autoComplete="off"
      leading={CURRENCY}
      value={focused ? value : group(value)}
      onChange={(event) => onChange?.(sanitize(event.target.value))}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
    />
  );
}
