import { env } from '@core/config/env.js';

// True while an area is answered by a local stand-in (see VITE_STAND_INS in .env.example).
export const isStandIn = (area) => env.standIns.includes(area);
