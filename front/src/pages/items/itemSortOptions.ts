import type { ItemSort } from "../../types/Item";

const ITEM_SORTS = {
  "name-asc": { label: "Ordenar por: Nome (A-Z)", sort: { field: "name", order: "asc" } },
  "name-desc": { label: "Ordenar por: Nome (Z-A)", sort: { field: "name", order: "desc" } },
  "calories-desc": {
    label: "Ordenar por: Calorias (maior)",
    sort: { field: "calories", order: "desc" },
  },
  "calories-asc": {
    label: "Ordenar por: Calorias (menor)",
    sort: { field: "calories", order: "asc" },
  },
} as const satisfies Record<string, { label: string; sort: ItemSort }>;

export type ItemSortOption = keyof typeof ITEM_SORTS;

export const ITEM_SORT_OPTIONS = Object.entries(ITEM_SORTS).map(([value, { label }]) => ({
  value,
  label,
}));

export function isItemSortOption(value: string): value is ItemSortOption {
  return Object.hasOwn(ITEM_SORTS, value);
}

export function apiSortFor(option: ItemSortOption): ItemSort {
  return ITEM_SORTS[option].sort;
}
