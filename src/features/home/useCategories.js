import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@core/data/queryKeys.js';
import { categoriesApi } from './api/categoriesApi.js';

// GET /categories for the edit sheet's category picker (Step 17). Categories change rarely, so a list fetched in the
// last few minutes is reused. If the request fails the sheet simply leaves the picker out: the category the server
// parsed stays as it is.
//   categories  [{ id, name }], or an empty list until the first answer.
export default function useCategories() {
  const query = useQuery({ queryKey: queryKeys.categories.list(), queryFn: categoriesApi.list, staleTime: 5 * 60 * 1000 });
  return { categories: query.data ?? [] };
}
