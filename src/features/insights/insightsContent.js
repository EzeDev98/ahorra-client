// All Insights copy lives here, so changing a word never means touching the screen.
export const INSIGHTS_COPY = {
  title: 'Insights',
  sectionPeriod: 'This period',
  sectionCategories: 'By category',
  period: 'Period',
  day: 'Day',
  incomeRange: 'Income range',
  baseline: 'Baseline',
  spent: 'Spent so far',
  against: 'Against baseline',
  dayOf: (elapsed, total) => `${elapsed} of ${total}`,
  range: (low, high) => `${low} to ${high}`,
  barLabel: (spent, baseline) => `${spent} of ${baseline} baseline`,
  share: (percent) => `${percent} of spend`,
  excess: (amount) => `${amount} of the excess`,
  nothingSpent: 'Nothing spent yet this period.',
  noIncomeTitle: 'Income not set',
  noIncomeDescription: 'Set your income range to see how your spending compares.',
  setIncome: 'Set income',
  loadFailed: 'Could not load your insights.',
  retry: 'Try again',
};

// The Plan section at the top of Insights (Step 19). Plain words, no verdicts.
export const PLAN_COPY = {
  heading: 'Your plan',
  starter: 'A starting point: your income baseline split 50/30/20, a common rule of thumb. It does not know your life yet.',
  observed: 'The same split, with what your confirmed entries show so far this period.',
  bucket: { NEEDS: 'Needs', WANTS: 'Wants', SAVINGS: 'Savings' },
  share: (percent) => `${percent}%`,
  obligations: (amount) => `Fixed obligations ${amount}`,
  room: (amount) => `${amount} left for everyday needs`,
  over: (amount) => `${amount} over this share`,
  exceed: 'Your fixed obligations are more than half of your income baseline.',
  seen: (seen, target) => `${seen} of ${target} so far`,
  unspent: (seen, target) => `${seen} unspent so far, of ${target}`,
};
