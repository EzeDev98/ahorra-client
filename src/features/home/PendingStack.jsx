import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { flip, run } from '@core/motion/motion.js';
import PendingCard from './PendingCard.jsx';

// A new card enters from just above with a short slide and fade (Guide 7.4).
const ENTER = [
  { opacity: 0, transform: 'translateY(-12px) scale(.98)' },
  { opacity: 1, transform: 'none' },
];

// The cards under the input line. It holds the list it is showing, so a change can go through flip(): the cards that
// stay glide to their new places while a new one slides in. The server sends oldest first; the newest shows on top.
// Cards already waiting when the list first arrives just appear; only ones that arrive later animate.
export default function PendingStack({ entries }) {
  const list = useRef(null);
  const [shown, setShown] = useState([]);
  const known = useRef(null); // ids the list has shown; null until the first answer arrives

  useEffect(() => {
    if (!entries) return undefined;
    let cancelled = false;

    // flushSync cannot run while React is flushing effects, so the change is applied a moment later.
    queueMicrotask(() => {
      if (cancelled || !list.current) return;
      const next = [...entries].reverse();
      const fresh = known.current ? next.filter((entry) => !known.current.has(String(entry.id))) : [];
      known.current = new Set(next.map((entry) => String(entry.id)));

      flip(list.current, () => flushSync(() => setShown(next)));

      fresh.forEach((entry) => {
        const card = list.current?.querySelector(`[data-entry-id="${CSS.escape(String(entry.id))}"]`);
        if (card) run(card, ENTER);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [entries]);

  return (
    <div ref={list} className="home__cards" aria-live="polite">
      {shown.map((entry) => (
        <PendingCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
