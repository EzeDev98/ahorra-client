// The edit sheet's logic, with no screen in it. A "draft" is the entry as the person is editing it: amounts and the
// date are kept as the text in the fields, so typing never fights a number.

// A pending entry -> a draft. Each item gets a key so rows keep their place when one is added or removed.
export function toDraft(entry) {
  return {
    flow: entry.flow,
    vendor: entry.vendor ?? '',
    categoryId: entry.categoryId == null ? '' : String(entry.categoryId),
    entryDate: entry.entryDate ?? '',
    items: entry.items.map((item, index) => ({ key: index, description: item.description, amount: String(item.amount) })),
  };
}

const amountOf = (text) => (text === '' || text === '.' ? Number.NaN : Number(text));

// Returns { hasErrors, date, items: [{ description?, amount? }] } holding only what is wrong, as codes the screen turns
// into words: 'description', 'amount', 'date'.
export function validateDraft(draft) {
  const items = draft.items.map((item) => {
    const problems = {};
    if (!item.description.trim()) problems.description = true;
    if (!(amountOf(item.amount) > 0)) problems.amount = true;
    return problems;
  });
  const date = draft.entryDate !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(draft.entryDate);
  const hasErrors = date || items.length === 0 || items.some((problems) => Object.keys(problems).length > 0);
  return { hasErrors, date, items };
}

// Only what changed, as the confirm body: a missing field is left as the server parsed it. Returns null when nothing
// changed, so the caller confirms with no body at all. A vendor that was cleared is not sent (the server has no way
// documented to blank it), so the parsed one stays.
export function toEdits(entry, draft) {
  const edits = {};

  if (draft.flow !== entry.flow) edits.flow = draft.flow;

  const vendor = draft.vendor.trim();
  if (vendor && vendor !== (entry.vendor ?? '')) edits.vendor = vendor;

  if (draft.entryDate && draft.entryDate !== entry.entryDate) edits.entryDate = draft.entryDate;

  if (draft.categoryId && Number(draft.categoryId) !== entry.categoryId) edits.categoryId = Number(draft.categoryId);

  const items = draft.items.map((item) => ({ description: item.description.trim(), amount: Number(item.amount) }));
  const unchanged =
    items.length === entry.items.length &&
    items.every((item, index) => item.description === entry.items[index].description && item.amount === Number(entry.items[index].amount));
  if (!unchanged) edits.items = items;

  return Object.keys(edits).length > 0 ? edits : null;
}

// The total of what is typed so far. A row that is not a number yet counts as nothing.
export const draftTotal = (draft) =>
  draft.items.reduce((sum, item) => {
    const amount = amountOf(item.amount);
    return Number.isNaN(amount) ? sum : sum + amount;
  }, 0);
