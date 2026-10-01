// Whether the app is locked right now. Step 8 (app lock) decides when it locks and unlocks and calls lock() and unlock().
// Until then it is never locked, so UnlockGuard lets every screen through.
let locked = false;
const listeners = new Set();

function setLocked(next) {
  if (locked === next) return;
  locked = next;
  listeners.forEach((listener) => listener());
}

export const lockState = {
  isLocked: () => locked,
  subscribe(listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  lock: () => setLocked(true),
  unlock: () => setLocked(false),
};
