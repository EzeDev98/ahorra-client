// All Onboarding copy lives here, so changing a word never means touching the screen.
// Typing only for now: voice is deferred, so nothing here promises it.
// The headline is two lines of different weight: the ask, then the promise.
export const HEADLINE = 'Tell Ahorra what you spent.';
export const SUBLINE = 'It keeps the books.';

// The demo above the features: an entry is typed, then the confirm card it becomes. Decorative, hidden from screen readers.
export const DEMO = {
  entryEmoji: '💬',
  entry: 'Spent ₦2,500 on lunch',
  resultEmoji: '🍲',
  label: 'Food · Spent',
  note: 'Lunch',
  amount: '₦2,500',
  confirm: 'Confirm',
};

// Emoji, not line icons, on this screen only (owner decision, 6 Oct 2026).
export const FEATURES = [
  {
    id: 'capture',
    emoji: '✍️',
    title: 'Write it the way you say it',
    description: 'Type what you spent or received, in your own words. Ahorra turns it into a proper record.',
  },
  {
    id: 'confirm',
    emoji: '✅',
    title: 'Nothing counts until you confirm',
    description: 'Every entry waits for your tap before it is saved to your books.',
  },
  {
    id: 'honest',
    emoji: '⚖️',
    title: 'Honest about your means',
    description: 'Your spending is read against the income you state. The numbers come without lectures.',
  },
  {
    id: 'daily',
    emoji: '📄',
    title: 'A short report each day',
    description: 'Once a day is settled, you get the numbers, the pattern and one thing to notice.',
  },
];
