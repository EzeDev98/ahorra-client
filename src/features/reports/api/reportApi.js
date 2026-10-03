import { httpClient } from '@core/http/httpClient.js';

// CategoryLine: { name, amount, sharePercent, attributedExcess }
// Verdict: 'OVER' | 'ON_TRACK' | 'UNDER' | 'NO_INCOME_SET'

export const reportApi = {
  // GET /report/ambient
  // out: { date, confirmedSpend, pendingSpend, pendingCount, provisionalSpend, hasUnconfirmed, usualDailySpend, daysObserved,
  //        comparisonAvailable, verdict, periodVariance, periodBaseline }
  getAmbient: () => httpClient.get('/report/ambient'),

  // GET /report/daily?from=&to=   (dates 'yyyy-MM-dd'; both optional, default is the last 30 days)
  // out: DailyReportSummary[], newest first. { date, kind: 'NO_ENTRIES' | 'STANDARD', entryCount, daySpend, verdict, summary }.
  listDaily: ({ from, to } = {}) => httpClient.get('/report/daily', { params: { from, to } }),

  // GET /report/daily/latest
  // out: DailyReport (below)
  getLatest: () => httpClient.get('/report/daily/latest'),

  // GET /report/daily/{date}
  // out: DailyReport: { date, kind: 'NO_ENTRIES' | 'STANDARD', summary, entryCount, daySpend, baseline, incomeMax, periodSpend,
  //      variance, rollingAvgDailySpend, daysObserved, verdict, insight, narrativeSource: 'AI' | 'TEMPLATE',
  //      dayCategories: CategoryLine[], periodCategories: CategoryLine[], plus period start and end fields }
  getDaily: (date) => httpClient.get(`/report/daily/${encodeURIComponent(date)}`),
};
