// The only place that runs animations. It uses the browser's Web Animations API (no library), animates
// only transform and opacity, reads every duration and easing from the tokens in tokens.css, and swaps
// movement for a short fade when the person has asked for reduced motion.
import { readTokenMs } from '@shared/utils/cssTime.js';

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

export const isReducedMotion = () => reducedQuery.matches;

// 'fast' | 'base' | 'fly' | 'stagger' read --motion-<name>. A number is used as milliseconds.
const toMs = (duration) => (typeof duration === 'number' ? duration : readTokenMs(`--motion-${duration}`));

// 'standard' | 'out' read --ease-<name>. Anything else (for example 'linear') is passed through as written.
const toEasing = (ease) =>
  ease === 'standard' || ease === 'out'
    ? getComputedStyle(document.documentElement).getPropertyValue(`--ease-${ease}`).trim()
    : ease;

// Delay for item number `index` in a staggered group (the cards flying out of the bell).
export const stagger = (index) => index * readTokenMs('--motion-stagger');

// Animates `el` through `frames` (Web Animations keyframes). Returns a promise that resolves when the
// animation ends or is cancelled, so callers can `await run(...)` and then remove the element.
//   duration  a token name or a number of milliseconds (default 'base')
//   ease      'standard' | 'out' | any CSS easing (default 'out')
//   delay     milliseconds
//   fill      'none' | 'forwards' | 'backwards' | 'both' (use 'forwards' when the element is removed afterwards)
// Reduced motion: only the opacity of the first and last frame is kept, played over --motion-reduced with no delay.
export function run(el, frames, { duration = 'base', ease = 'out', delay = 0, fill = 'none' } = {}) {
  let keyframes = frames;
  let ms = toMs(duration);
  let wait = delay;

  if (isReducedMotion()) {
    const from = frames[0].opacity ?? 1;
    const to = frames[frames.length - 1].opacity ?? 1;
    keyframes = [{ opacity: from }, { opacity: to }];
    ms = readTokenMs('--motion-reduced');
    wait = 0;
  }

  return el.animate(keyframes, { duration: ms, easing: toEasing(ease), delay: wait, fill }).finished.catch(() => {});
}

// Sibling reflow. Call it with the element that holds the siblings and a function that adds or removes
// one of them; the ones that stay glide from where they were to where they now are.
//   flip(listEl, () => el.remove());
// The function must change the DOM before it returns. In React, wrap the state update:
//   flip(listEl, () => flushSync(() => setEntries(next)));
// Positions are measured relative to the container, so scrolling in between cannot cause a false move.
// Reduced motion: the change is applied with no animation.
export function flip(container, mutate, options = {}) {
  if (isReducedMotion()) {
    mutate();
    return;
  }

  const offsets = () => {
    const top = container.getBoundingClientRect().top;
    return new Map([...container.children].map((child) => [child, child.getBoundingClientRect().top - top]));
  };

  const before = offsets();
  mutate();
  const after = offsets();

  after.forEach((offset, child) => {
    if (!before.has(child)) return;
    const dy = before.get(child) - offset;
    if (dy) run(child, [{ transform: `translateY(${dy}px)` }, { transform: 'none' }], options);
  });
}
