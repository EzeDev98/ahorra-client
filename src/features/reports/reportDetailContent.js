// All report detail copy lives here, so changing a word never means touching the screen.
export const DETAIL_COPY = {
  title: 'Report',
  // A day with nothing logged is an absence of logging, never an amount (Guide 2.4).
  noEntries: 'No entries logged on this day',
  sectionDay: 'The day',
  sectionPeriod: 'This period',
  sectionDayCategories: 'By category, this day',
  sectionPeriodCategories: 'By category, this period',
  spent: 'Spent',
  entries: 'Entries',
  usual: 'Usual day',
  periodSpent: 'Spent this period',
  baseline: 'Baseline',
  incomeRange: 'Income range',
  against: 'Against baseline',
  range: (low, high) => `${low} to ${high}`,
  excess: (amount) => `${amount} of the excess`,
  notFoundTitle: 'No report for this day',
  notFoundDescription: 'A report appears once a day’s entries are confirmed and the day is closed.',
  loadFailed: 'Could not load this report.',
  retry: 'Try again',
};

// How a variance reads. Descriptive only: the amount and a direction, never a judgement (Guide 1.1).
export const VARIANCE_WORDS = {
  over: (amount) => `${amount} over`,
  under: (amount) => `${amount} under`,
  on: 'On baseline',
};
