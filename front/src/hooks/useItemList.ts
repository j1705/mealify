import { useCallback } from "react";
import { listItems } from "../services/itemService";
import type { ItemSort } from "../types/Item";
import { usePagedSearch, type PageQuery } from "./usePagedSearch";

export type ItemListOptions = PageQuery & { sort?: ItemSort };

export function useItemList({ search, page, limit, sort }: ItemListOptions) {
  const sortField = sort?.field;
  const sortOrder = sort?.order;
  const fetchPage = useCallback(
    (query: PageQuery, signal: AbortSignal) => {
      const currentSort =
        sortField && sortOrder ? { field: sortField, order: sortOrder } : undefined;
      return listItems({ ...query, sort: currentSort }, signal);
    },
    [sortField, sortOrder],
  );
  return usePagedSearch(fetchPage, { search, page, limit });
}
