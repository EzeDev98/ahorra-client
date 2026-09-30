import { httpClient } from '@core/http/httpClient.js';

export const behaviorApi = {
  // GET /behavior/overview
  // out: { asOf, mode: 'OBSERVATION' | 'JUDGMENT', daysObserved, daysUntilJudgment, confidence, baselines: [],
  //        habits: [{ description, frequencyPerWeek, avgAmount, trendDirection, confidence, first and last observed }],
  //        trend: { direction: 'STABLE' | 'WORSENING' | 'IMPROVING', slopePerWeek, latestRatioPercent, weeksUsed, livingAboveMeans },
  //        todayZScore, todayUnusual }
  getOverview: () => httpClient.get('/behavior/overview'),
};
