import { CircleCheck, FileText, PencilLine, Scale } from 'lucide-react';

// All Onboarding copy lives here, so changing a word never means touching the screen.
// Typing only for now: voice is deferred, so nothing here promises it.
export const TAGLINE = 'Tell Ahorra what you spent. It keeps the books.';

export const FEATURES = [
  {
    id: 'capture',
    icon: PencilLine,
    title: 'Write it the way you say it',
    description: 'Type what you spent or received, in your own words. Ahorra turns it into a proper record.',
  },
  {
    id: 'confirm',
    icon: CircleCheck,
    title: 'Nothing counts until you confirm',
    description: 'Every entry waits for your tap before it is saved to your books.',
  },
  {
    id: 'honest',
    icon: Scale,
    title: 'Honest about your means',
    description: 'Your spending is read against the income you state. The numbers come without lectures.',
  },
  {
    id: 'daily',
    icon: FileText,
    title: 'A short report each day',
    description: 'Once a day is settled, you get the numbers, the pattern and one thing to notice.',
  },
];
