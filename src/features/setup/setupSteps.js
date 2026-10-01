// The screens in first-run setup that count as steps: income, then fixed obligations.
// The app-lock offer and the finish are not steps, so the indicator never shows them.
export const SETUP_STEP_COUNT = 2;

// Router state sent with the navigation from the lock offer to Set PIN. Set PIN (Step 8c) reads
// useLocation().state?.fromSetup: when true it continues to the end of setup instead of back to Settings.
export const FROM_SETUP = Object.freeze({ fromSetup: true });
