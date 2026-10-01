// Every query key in the app, defined once. Screens never write a key literal.
// Note for Step 9: give the day status query staleTime: 0, so every mount re-checks the gate.
export const queryKeys = {
  day: {
    all: ['day'],
    status: () => ['day', 'status'],
  },
  entries: {
    all: ['entries'],
    pending: () => ['entries', 'pending'],
  },
  report: {
    all: ['report'],
    ambient: () => ['report', 'ambient'],
    list: ({ from, to } = {}) => ['report', 'list', { from: from ?? null, to: to ?? null }],
    latest: () => ['report', 'latest'],
    detail: (date) => ['report', 'detail', date],
  },
  income: {
    all: ['income'],
    current: () => ['income', 'current'],
    history: () => ['income', 'history'],
    variance: (date) => ['income', 'variance', date ?? null],
  },
  obligations: {
    all: ['obligations'],
    list: () => ['obligations', 'list'],
  },
  behavior: {
    all: ['behavior'],
    overview: () => ['behavior', 'overview'],
  },
};
