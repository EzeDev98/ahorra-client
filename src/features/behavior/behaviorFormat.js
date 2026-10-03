import { formatPercent } from '@features/reports/reportFormat.js';
import { BEHAVIOR_COPY } from './behaviorContent.js';

const COUNT = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 1 });
const formatCount = (value) => COUNT.format(Number(value) || 0);

// The server's confidence runs from 0 to 1. 0.8 -> "80%".
export const formatConfidence = (value) => formatPercent(Math.round((Number(value) || 0) * 100));

// Percentage points a week. 2.5 -> "Up 2.5 points", -1 -> "Down 1 points" is avoided by the flat band below.
export function slopeWords(slope) {
  const points = Number(slope) || 0;
  if (Math.abs(points) < 0.05) return BEHAVIOR_COPY.slopeFlat;
  return points > 0 ? BEHAVIOR_COPY.slopeUp(formatCount(points)) : BEHAVIOR_COPY.slopeDown(formatCount(-points));
}

// 1 -> "Once a week", 2.5 -> "2.5 times a week".
export function frequencyWords(perWeek) {
  const count = Number(perWeek) || 0;
  return Math.abs(count - 1) < 0.05 ? BEHAVIOR_COPY.frequencyOnce : BEHAVIOR_COPY.frequencyTimes(formatCount(count));
}

// "Food" and WEEKDAY -> "Food on weekdays".
export const baselineName = (category, dayType) => `${category}${BEHAVIOR_COPY.dayTypes[dayType] ?? ''}`;
