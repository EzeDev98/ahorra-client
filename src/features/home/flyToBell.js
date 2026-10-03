import { run, stagger } from '@core/motion/motion.js';

// The flight of a card into the bell (Guide 7.6). A copy of the card is flown, so the real one can leave the list at
// once and the cards beneath can glide up while the copy travels. Start and end are measured when this is called, so the
// path is right on any screen size. transform and opacity only.
const END_SCALE = 0.06; // the card shrinks to about 6%
const BOW = 0.16; // the path bows sideways by about 16% of the distance at its middle
const STEPS = 16; // points sampled along the curve

const centre = (rect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

// A floating copy of a card, at the card exact place, for a flight. It is above the page and never takes a tap or focus.
function makeCopy(card, from) {
  const copy = card.cloneNode(true);
  ['data-entry-id', 'tabindex', 'aria-label'].forEach((name) => copy.removeAttribute(name));
  copy.setAttribute('aria-hidden', 'true');
  copy.setAttribute('inert', '');
  copy.classList.add('home__fly');
  Object.assign(copy.style, {
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    transform: '',
    opacity: '',
  });
  document.body.appendChild(copy);
  return copy;
}

// Returns a promise that resolves when the copy has arrived and been removed. The card is hidden straight away.
export function flyToBell(card, bell) {
  const from = card.getBoundingClientRect();
  const start = centre(from);
  const end = centre(bell.getBoundingClientRect());
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy) || 1;

  // A curve through the start and the bell whose middle sits BOW * distance off the straight line.
  const control = { x: dx / 2 + (-dy / distance) * distance * BOW * 2, y: dy / 2 + (dx / distance) * distance * BOW * 2 };

  const frames = Array.from({ length: STEPS + 1 }, (_, index) => {
    const t = index / STEPS;
    const x = 2 * (1 - t) * t * control.x + t * t * dx;
    const y = 2 * (1 - t) * t * control.y + t * t * dy;
    const scale = 1 + (END_SCALE - 1) * t;
    const opacity = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
    return { transform: `translate(${x}px, ${y}px) scale(${scale})`, opacity };
  });

  const copy = makeCopy(card, from);
  card.style.visibility = 'hidden';

  return run(copy, frames, { duration: 'fly', ease: 'standard', fill: 'forwards' }).then(() => copy.remove());
}

// The bell's answer on arrival: scale 1 to 1.18 to 1 over one base duration.
export const pulseBell = (bell) => run(bell, [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 'base' });

// The reverse flight (Guide 7.6): a card comes back out of the bell and grows into its place, 440 ms, ease-out, each one
// index * 70 ms after the one before. A copy flies, as in flyToBell, so the list's own edges never clip it, and the real
// card (placed in the list already, hidden) is shown when the copy lands.
// area is the scrolling list. A card whose place is scrolled out of view is just shown at once: a copy flying to
// somewhere off screen would be pointless, and one over the input would look wrong.
export function flyFromBell(card, bell, index, area) {
  const to = card.getBoundingClientRect();
  const view = area.getBoundingClientRect();
  if (to.bottom <= view.top || to.top >= view.bottom) return Promise.resolve();

  const start = centre(bell.getBoundingClientRect());
  const end = centre(to);
  const copy = makeCopy(card, to);
  card.style.visibility = 'hidden';

  const frames = [
    { transform: `translate(${start.x - end.x}px, ${start.y - end.y}px) scale(${END_SCALE})`, opacity: 0 },
    { transform: 'none', opacity: 1 },
  ];
  return run(copy, frames, { duration: 'fly', ease: 'out', delay: stagger(index), fill: 'backwards' }).then(() => {
    card.style.visibility = '';
    copy.remove();
  });
}
