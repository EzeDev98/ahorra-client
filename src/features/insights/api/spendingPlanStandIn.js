// Stand-in for the missing spending-plan endpoint: the generic split the design doc suggests (still open).
export const spendingPlanStandIn = {
  get: async () => ({
    basis: 'GENERIC',
    split: [
      { name: 'Needs', percent: 50 },
      { name: 'Wants', percent: 30 },
      { name: 'Savings', percent: 20 },
    ],
  }),
};
