import { httpClient } from '@core/http/httpClient.js';

export const categoriesApi = {
  // GET /categories
  // out: [{ id, name }], the signed-in user's active categories, sorted by name.
  list: () => httpClient.get('/categories'),
};
