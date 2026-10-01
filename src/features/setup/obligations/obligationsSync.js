import { snapshot, toBody, toObligation } from './obligationsRules.js';

// Brings the server's list in line with the form: removes what was removed, creates what is new, updates what changed.
// It stops at the first failure. Progress is reported as it happens (onRemoved, onSaved), so a retry after a failure
// only does the work that is left and never creates anything twice.
// Returns the full list as the server now has it.
export async function syncObligations({ rows, removedIds, api, onRemoved, onSaved }) {
  for (const id of removedIds) {
    await api.remove(id);
    onRemoved(id);
  }

  const result = [];
  for (const row of rows) {
    if (!row.id) {
      const created = await api.create(toBody(row));
      onSaved(row.key, { id: created.id, saved: snapshot(row) });
      result.push(created);
    } else if (row.saved !== snapshot(row)) {
      const updated = await api.update(row.id, { ...toBody(row), active: row.active });
      onSaved(row.key, { saved: snapshot(row) });
      result.push(updated);
    } else {
      result.push(toObligation(row));
    }
  }
  return result;
}
