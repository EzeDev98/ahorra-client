import { useSyncExternalStore } from 'react';

// The entries the person has sent to the bell with Later (Guide 7.5). Held in memory only, on purpose: a launch starts
// with an empty bell, so every pending entry is back on Home each time the app is opened (Guide 7.8).
//   parked  ids hidden from the stack, from the moment the card starts to fly.
//   inBell  ids that have arrived in the bell: what the badge counts. It rises when the flight ends, not when it starts.
//   returning  ids sent back out by a tap on the bell, with their place in the order they fly out (0, 1, 2 ...). The stack
//              reads it to make those cards fly out of the bell instead of sliding in, then calls finishReturn.
// A snapshot is replaced, never changed, so useSyncExternalStore can tell when it moved.
let state = { parked: new Set(), inBell: new Set(), returning: new Map() };
const listeners = new Set();

const update = (next) => {
  state = next;
  listeners.forEach((listener) => listener());
};

// How many places are showing Home right now (it attaches while mounted). With Home on screen a return can be animated.
let watching = 0;

// Moves the given parked ids back to the stack, remembering the order they should fly out in. Returns the ids.
function sendBack(ids) {
  if (ids.length === 0) return ids;
  const parked = new Set(state.parked);
  const inBell = new Set(state.inBell);
  const returning = new Map(state.returning);
  ids.forEach((id, order) => {
    parked.delete(id);
    inBell.delete(id);
    returning.set(id, order);
  });
  update({ parked, inBell, returning });
  return ids;
}

export const parkedEntries = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => state,
  park: (id) => update({ ...state, parked: new Set(state.parked).add(String(id)) }),
  // The flight into the bell ended. Ignored if the entry was released meanwhile (an app open can come mid-flight).
  settle(id) {
    if (!state.parked.has(String(id))) return;
    update({ ...state, inBell: new Set(state.inBell).add(String(id)) });
  },
  // Empties the bell without any animation. Used when the app is opened and Home is not on screen to animate it.
  clear() {
    if (state.parked.size === 0 && state.returning.size === 0) return;
    update({ parked: new Set(), inBell: new Set(), returning: new Map() });
  },

  // A tap on the bell (Step 9j): sends back every entry that has arrived in it, in the order they arrived, and returns
  // their ids. An entry still flying in is left alone, so no card is ever on screen twice.
  release: () => sendBack([...state.inBell]),

  // An app open (Step 9k): sends back everything parked, including an entry still flying in, in the order they were parked.
  releaseAll: () => sendBack([...state.parked]),

  // Home calls this while it is on screen, and calls the function it returns when it leaves.
  attach() {
    watching += 1;
    return () => {
      watching -= 1;
    };
  },

  // The app was opened again (Guide 7.8). With Home on screen the entries fly back out of the bell; otherwise they are
  // simply set free, so Home shows them all as soon as it appears.
  resurface() {
    if (watching > 0) parkedEntries.releaseAll();
    else parkedEntries.clear();
  },

  // The stack has started those cards on their way out; forget them. Changes nothing for ids that were not returning.
  finishReturn(ids) {
    if (!ids.some((id) => state.returning.has(id))) return;
    const returning = new Map(state.returning);
    ids.forEach((id) => returning.delete(id));
    update({ ...state, returning });
  },
};

export const useParked = () => useSyncExternalStore(parkedEntries.subscribe, parkedEntries.getSnapshot);
