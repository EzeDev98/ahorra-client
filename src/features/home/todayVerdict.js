import { PANEL_COPY, USUAL_WORDS } from './sidePanelContent.js';

// How far from the usual day still counts as "about your usual": 0.1 is ten percent either way.
const NEAR_USUAL = 0.1;

// The quiet line under today's total (Guide 7.2), as a plain function of GET /report/ambient.
// Returns { value, label } for the Verdict component, { label } for plain words with no verdict, or null for no line.
// The comparison uses the total shown above it (confirmed plus pending), so the line and the number agree.
// During the first weeks the server sets comparisonAvailable to false and no verdict is given (Guide 2.3).
export function todayVerdict(ambient) {
  if (!ambient) return null;
  if (ambient.verdict === 'NO_INCOME_SET') return { value: 'NO_INCOME_SET' };

  const spend = Number(ambient.provisionalSpend) || 0;
  if (spend === 0) return { label: PANEL_COPY.nothingLogged };
  if (!ambient.comparisonAvailable) return null;

  const usual = Number(ambient.usualDailySpend) || 0;
  if (spend > usual * (1 + NEAR_USUAL)) return { value: 'OVER', label: USUAL_WORDS.above };
  if (spend < usual * (1 - NEAR_USUAL)) return { value: 'UNDER', label: USUAL_WORDS.below };
  return { value: 'ON_TRACK', label: USUAL_WORDS.about };
}
