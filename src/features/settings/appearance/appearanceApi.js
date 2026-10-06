import { httpClient } from '@core/http/httpClient.js';

// CONTRACT. The server has these endpoints (AppearanceController). The theme is kept on the user, so it survives a reinstall.

export const appearanceApi = {
  // GET /appearance
  // out: { theme }   'SYSTEM' | 'LIGHT' | 'DARK', or null when the person never chose one
  get: () => httpClient.get('/appearance'),

  // PUT /appearance
  // in:  { theme }   'SYSTEM' | 'LIGHT' | 'DARK'
  // out: { theme }
  set: (theme) => httpClient.put('/appearance', { theme }),
};
