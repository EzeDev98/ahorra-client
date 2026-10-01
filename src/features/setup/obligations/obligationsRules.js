// The form's rows and their rules. The contract for what the server must accept is in obligationsApi.js.
// The server (once it exists) still has the last word: its message is shown when it refuses something this file let through.
import { MAX_AMOUNT } from '@features/setup/income/incomeRules.js';

export const MAX_NAME_LENGTH = 60;
export const DEFAULT_CADENCE = 'MONTHLY';

export const CADENCES = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

// The tap-to-add chips. A bill added from one has its name locked; "Other" is the only way to type a name.
export const SUGGESTIONS = ['Rent', 'Data / Airtime', 'Electricity', 'Streaming', 'Internet', 'Loan repayment', 'Insurance'];

let counter = 0;
const nextKey = () => `obligation-${++counter}`;

// An empty box or a lone dot is not a number.
const toNumber = (text) => (text === '' || text === '.' ? NaN : Number(text));

// What was last saved for a row, as a string, so "has this row changed?" is a simple comparison.
export const snapshot = (row) => JSON.stringify([row.name.trim(), toNumber(row.amount), row.cadence]);

// A new, unsaved row. id is null until the server has created it; saved is null until then too.
export function newRow(name = '') {
  return {
    key: nextKey(),
    id: null,
    name,
    amount: '',
    cadence: DEFAULT_CADENCE,
    active: true,
    preset: SUGGESTIONS.includes(name),
    saved: null,
  };
}

// Rows from the server's list, each marked as already saved.
export function rowsFromObligations(list) {
  return list.map((item) => {
    const row = {
      key: nextKey(),
      id: item.id,
      name: item.name,
      amount: String(item.amount),
      cadence: item.cadence,
      active: item.active,
      preset: SUGGESTIONS.includes(item.name),
      saved: null,
    };
    return { ...row, saved: snapshot(row) };
  });
}

// Returns { [rowKey]: { name?, amount? } } holding only the rows and fields that are wrong.
export function validateRows(rows) {
  const errors = {};
  rows.forEach((row) => {
    const problems = {};
    const amount = toNumber(row.amount);

    if (!row.name.trim()) problems.name = 'Give this bill a name.';

    if (Number.isNaN(amount)) problems.amount = 'Enter the amount.';
    else if (amount <= 0) problems.amount = 'Amount must be more than zero.';
    else if (amount >= MAX_AMOUNT) problems.amount = 'That amount is too large.';

    if (Object.keys(problems).length) errors[row.key] = problems;
  });
  return errors;
}

// The body of POST /obligations and PUT /obligations/{id} (active is added by the caller for PUT).
export const toBody = (row) => ({ name: row.name.trim(), amount: Number(row.amount), cadence: row.cadence });

// A row in the shape the server returns, for rows that needed no request.
export const toObligation = (row) => ({ id: row.id, ...toBody(row), active: row.active });
