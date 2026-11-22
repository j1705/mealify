import { PaginationInput } from "./PaginationQuery";

export const ITEM_SORT_FIELDS = ["name", "calories", "createdAt"] as const;
export type ItemSortField = (typeof ITEM_SORT_FIELDS)[number];

export const SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export type ItemSort = { field: ItemSortField; order: SortOrder };

export const DEFAULT_ITEM_SORT: ItemSort = { field: "createdAt", order: "desc" };

export type ItemListQuery = PaginationInput & {
  search?: string | undefined;
  sort: ItemSort;
};
