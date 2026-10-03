// All Reports copy lives here, so changing a word never means touching the screen.
export const REPORTS_COPY = {
  title: 'Reports',
  emptyTitle: 'No reports yet',
  emptyDescription: 'A report for each day appears here once that day\u2019s entries are confirmed.',
  loadFailed: 'Could not load your reports.',
  retry: 'Try again',
  entries: (count) => (count === 1 ? '1 entry' : `${count} entries`),
  // A day with nothing logged is an absence of logging, never an amount (Guide 2.4).
  noEntries: 'No entries logged',
};
