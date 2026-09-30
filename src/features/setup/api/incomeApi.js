import { httpClient } from '@core/http/httpClient.js';

// Income: { id, minAmount, maxAmount, periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM', periodLength, effectiveFrom, effectiveTo }
//         effectiveTo is exclusive and null for the current record.

export const incomeApi = {
  // GET /income
  // out: Income, or null when income has not been set yet (the server answers 404).
  async get() {
    try {
      return await httpClient.get('/income');
    } catch (error) {
      if (error.isNotFound) return null;
      throw error;
    }
  },

  // PUT /income   (closes the current record and starts a new one)
  // in:  { minAmount >= 0, maxAmount >= 0, periodType, periodLength (days, required and positive only for CUSTOM) }
  // out: Income. 400 validation.
  set: ({ minAmount, maxAmount, periodType, periodLength }) =>
    httpClient.put('/income', { minAmount, maxAmount, periodType, periodLength }),

  // GET /income/history
  // out: Income[]
  getHistory: () => httpClient.get('/income/history'),

  // GET /income/variance?date=   (date 'yyyy-MM-dd', optional)
  // out: { asOf, daysElapsed, daysInPeriod, incomeMin, incomeMax, baseline, spend, variance,
  //        categories: [{ categoryId, categoryName, amount, shareOfSpendPercent, attributedExcess }], plus period start and end fields }
  getVariance: ({ date } = {}) => httpClient.get('/income/variance', { params: { date } }),
};
