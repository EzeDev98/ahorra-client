import { useSyncExternalStore } from 'react';

// The one quiet line on Home that points to Settings, Daily reminder (Step 16c). It is armed by the first confirmed
// entry and then shown until it is dismissed or followed, once per device. Nothing here asks for the notification
// permission: the line only leads to the Settings screen where the person switches the reminder on.
const KEY = 'ahorra.reminder.nudge';
const listeners = new Set();

function read() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return 'done'; // storage unavailable: never show a line that could not be dismissed for good
  }
}

function write(value) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // Storage unavailable: the line simply stays away.
  }
  listeners.forEach((listener) => listener());
}

export const reminderNudge = {
  // Called after a confirmed entry. Only the first one counts; a line already shown or dismissed stays as it is.
  arm() {
    if (read() === null) write('armed');
  },

  dismiss() {
    write('done');
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    return read() === 'armed';
  },
};

export function useReminderNudgeArmed() {
  return useSyncExternalStore(reminderNudge.subscribe, reminderNudge.getSnapshot);
}
