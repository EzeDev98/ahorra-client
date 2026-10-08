import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { flip, run } from '@core/motion/motion.js';
import Button from '@shared/components/ui/Button.jsx';
import InfoBanner from '@shared/components/ui/InfoBanner.jsx';
import EditEntrySheet from './EditEntrySheet.jsx';
import PendingCard from './PendingCard.jsx';
import useConfirmEntry from './useConfirmEntry.js';
import useDiscardEntry from './useDiscardEntry.js';
import { flyFromBell, flyToBell, pulseBell } from './flyToBell.js';
import { parkedEntries } from './parkedEntries.js';
import { STACK_COPY } from './pendingContent.js';

// A new card enters from just above with a short slide and fade (Guide 7.4).
const ENTER = [
  { opacity: 0, transform: 'translateY(-12px) scale(.98)' },
  { opacity: 1, transform: 'none' },
];

// A confirmed card fades and shrinks a little where it stands; the cards beneath then glide up (Guide 7.4).
const LEAVE = [
  { opacity: 1, transform: 'none' },
  { opacity: 0, transform: 'scale(.96)' },
];

// A blocked swipe shakes the gate note: a short wiggle sideways and back (Guide 7.7).
const SHAKE = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-6px)' },
  { transform: 'translateX(5px)' },
  { transform: 'translateX(0)' },
];

// The cards under the input line. It holds the list it is showing, so a change can go through flip(): the cards that
// stay glide to their new places while a new one slides in. The server sends oldest first; the newest shows on top.
// Cards already waiting when the list first arrives just appear; only ones that arrive later animate.
// loadFailed: the first load of the list failed, so there is nothing to show yet. The notice offers onRetry and shows
// busy while retrying. A failed refresh after a good load keeps the last list on screen instead.
// gated and note (Step 9l): while the day is gated the note sits above the cards in the words of note, Later is off and a
// swipe that would park a card springs back and shakes the note. The note comes and goes through flip() too, so the
// cards glide down and up around it instead of jumping.
export default function PendingStack({ entries, gated, note, loadFailed, retrying, onRetry }) {
  const list = useRef(null);
  const [shown, setShown] = useState([]);
  const known = useRef(null); // ids the list has shown; null until the first answer arrives
  const confirmEntry = useConfirmEntry();
  const discardEntry = useDiscardEntry();
  const inFlight = useRef(new Set()); // ids being confirmed right now, so a second tap does nothing
  const [confirming, setConfirming] = useState([]); // the same ids, for showing the busy state
  const [discarding, setDiscarding] = useState([]); // ids being discarded right now
  const [editing, setEditing] = useState(null); // the entry the edit sheet shows; kept while the sheet closes
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0); // new at every opening, so the form starts from the entry again
  const noteRef = useRef(null);
  const [noteText, setNoteText] = useState(null); // the words the note shows; changes go through flip() below

  const edit = (entry) => {
    setEditing(entry);
    setSheetKey((key) => key + 1);
    setSheetOpen(true);
  };

  const confirm = async (entry, edits, onError) => {
    const id = String(entry.id);
    if (inFlight.current.has(id)) return;
    inFlight.current.add(id);
    setConfirming((current) => [...current, id]);

    const confirmed = await confirmEntry(
      entry,
      () => {
        setSheetOpen(false); // closes the edit sheet when it started this confirm
        const card = list.current?.querySelector(`[data-entry-id="${CSS.escape(id)}"]`);
        return card ? run(card, LEAVE, { fill: 'forwards' }) : undefined;
      },
      { edits, onError },
    );

    // A confirmed card is removed from the list by the effect below; only a failed one needs its button back.
    if (!confirmed) {
      inFlight.current.delete(id);
      setConfirming((current) => current.filter((item) => item !== id));
    }
  };

  // Discard, from the edit sheet: the card fades out like a confirmed one and a toast offers Undo. It is allowed while the
  // day is gated, because it is how a wrong entry stops blocking the day.
  const discard = async (entry, onError) => {
    const id = String(entry.id);
    if (inFlight.current.has(id)) return;
    inFlight.current.add(id);
    setDiscarding((current) => [...current, id]);

    const discarded = await discardEntry(
      entry,
      () => {
        setSheetOpen(false);
        const card = list.current?.querySelector(`[data-entry-id="${CSS.escape(id)}"]`);
        return card ? run(card, LEAVE, { fill: 'forwards' }) : undefined;
      },
      { onError },
    );

    if (!discarded) {
      inFlight.current.delete(id);
      setDiscarding((current) => current.filter((item) => item !== id));
    }
  };

  // Later, by button or by swipe (9i): the card flies into the bell and leaves the list at once, so the cards beneath glide
  // up while it travels. The bell counts it, and pulses, when it arrives.
  const later = (entry) => {
    const id = String(entry.id);
    if (gated || parkedEntries.getSnapshot().parked.has(id)) return;
    const card = list.current?.querySelector(`[data-entry-id="${CSS.escape(id)}"]`);
    const bell = document.querySelector('[data-bell]');
    const flight = card && bell ? flyToBell(card, bell) : Promise.resolve();
    parkedEntries.park(id);
    flight.then(() => {
      parkedEntries.settle(id);
      if (bell) pulseBell(bell);
    });
  };

  const shakeNote = () => {
    if (noteRef.current) run(noteRef.current, SHAKE, { duration: 'base', ease: 'standard' });
  };

  // The note appears and disappears with the gate; the cards around it glide to their new places.
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled || !list.current) return;
      flip(list.current, () => flushSync(() => setNoteText(note)));
    });
    return () => {
      cancelled = true;
    };
  }, [note]);

  // A card can be dragged in any direction, which on a touch screen fights scrolling. So a card only claims the gesture
  // when the list does not scroll; when it does, up and down scroll the list and only sideways drags park a card.
  useEffect(() => {
    const element = list.current;
    if (!element) return undefined;
    const update = () => {
      element.dataset.scrolls = String(element.scrollHeight > element.clientHeight + 1);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [shown]);

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

      // Cards coming back from the bell fly out of it, one after another (Guide 7.6); any other new card slides in.
      const { returning } = parkedEntries.getSnapshot();
      const bell = document.querySelector('[data-bell]');
      fresh.forEach((entry) => {
        const id = String(entry.id);
        const card = list.current?.querySelector(`[data-entry-id="${CSS.escape(id)}"]`);
        if (!card) return;
        if (bell && returning.has(id)) flyFromBell(card, bell, returning.get(id), list.current);
        else run(card, ENTER);
      });
      parkedEntries.finishReturn(fresh.map((entry) => String(entry.id)));
    });

    return () => {
      cancelled = true;
    };
  }, [entries]);

  // If the entry being edited is no longer in the list (confirmed elsewhere, or the day got gated), close the sheet.
  useEffect(() => {
    if (sheetOpen && entries && editing && !entries.some((item) => String(item.id) === String(editing.id))) {
      setSheetOpen(false);
    }
  }, [entries, editing, sheetOpen]);

  return (
    <div ref={list} className="home__cards" aria-live="polite">
      {noteText && (
        <p ref={noteRef} className="home__gate-note">
          {noteText}
        </p>
      )}
      {loadFailed && (
        <InfoBanner
          tone="error"
          action={
            <Button variant="secondary" busy={retrying} onClick={onRetry}>
              {STACK_COPY.retry}
            </Button>
          }
        >
          {STACK_COPY.loadFailed}
        </InfoBanner>
      )}
      {shown.map((entry) => (
        <PendingCard
          key={entry.id}
          entry={entry}
          onConfirm={() => confirm(entry)}
          onLater={() => later(entry)}
          gated={gated}
          onGatedSwipe={shakeNote}
          onEdit={() => edit(entry)}
          busy={confirming.includes(String(entry.id)) || discarding.includes(String(entry.id))}
        />
      ))}
      {editing && (
        <EditEntrySheet
          key={sheetKey}
          entry={editing}
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onConfirm={(edits, onError) => confirm(editing, edits, onError)}
          onDiscard={(onError) => discard(editing, onError)}
          busy={confirming.includes(String(editing.id))}
          discardBusy={discarding.includes(String(editing.id))}
        />
      )}
    </div>
  );
}
