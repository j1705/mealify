import type { Item, ItemInput, ItemSort, MostUsedItem } from "../types/Item";
import type { Paginated } from "../types/Pagination";
import { withTrimmedName } from "../utils/text";
import { request } from "./http";

const API_MAX_LIMIT = 100;

export type ItemQuery = {
  search?: string;
  page?: number;
  limit?: number;
  sort?: ItemSort;
};

export async function listItems(
  query: ItemQuery = {},
  signal?: AbortSignal,
): Promise<Paginated<Item>> {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? API_MAX_LIMIT),
  });
  const search = query.search?.trim();
  if (search) params.set("search", search);
  if (query.sort) {
    params.set("sort", query.sort.field);
    params.set("order", query.sort.order);
  }
  return request<Paginated<Item>>(`/items?${params}`, "Não foi possível carregar os itens", {
    signal,
  });
}

export async function countItems(signal?: AbortSignal): Promise<number> {
  return (await listItems({ limit: 1 }, signal)).pagination.total;
}

export async function getMostUsedItems(
  limit: number,
  signal?: AbortSignal,
): Promise<MostUsedItem[]> {
  const ranking = await request<{ data: MostUsedItem[] }>(
    `/items/most-used?limit=${limit}`,
    "Não foi possível carregar os itens mais usados",
    { signal },
  );
  return ranking.data;
}

export async function getItem(itemId: number, signal?: AbortSignal): Promise<Item> {
  return request<Item>(`/items/${itemId}`, "Não foi possível carregar o item", { signal });
}

export async function createItem(input: ItemInput): Promise<void> {
  await request("/items", "Não foi possível criar o item", {
    method: "POST",
    body: withTrimmedName(input),
  });
}

export async function updateItem(itemId: number, input: ItemInput): Promise<void> {
  await request(`/items/${itemId}`, "Não foi possível atualizar o item", {
    method: "PUT",
    body: withTrimmedName(input),
  });
}

export async function deleteItem(itemId: number): Promise<void> {
  await request(`/items/${itemId}`, "Não foi possível excluir o item", { method: "DELETE" });
}
