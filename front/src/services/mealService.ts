import type { DailyTotals, Meal, MealInput } from "../types/Meal";
import type { Paginated } from "../types/Pagination";
import { request } from "./http";

type MealPayload = Omit<MealInput, "description"> & { description?: string };

function toMealPayload({ name, description, ...rest }: MealInput): MealPayload {
  const trimmedDescription = description.trim();
  return {
    ...rest,
    name: name.trim(),
    ...(trimmedDescription && { description: trimmedDescription }),
  };
}

export type MealQuery = {
  search?: string;
  page: number;
  limit: number;
  date?: string;
};

export async function listMeals(
  { search, page, limit, date }: MealQuery,
  signal?: AbortSignal,
): Promise<Paginated<Meal>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const term = search?.trim();
  if (term) params.set("search", term);
  if (date) params.set("date", date);
  return request<Paginated<Meal>>(`/meals?${params}`, "Não foi possível carregar as refeições", {
    signal,
  });
}

export async function getMeal(mealId: number, signal?: AbortSignal): Promise<Meal> {
  return request<Meal>(`/meals/${mealId}`, "Não foi possível carregar a refeição", { signal });
}

export async function getDailyTotals(date: string, signal?: AbortSignal): Promise<DailyTotals> {
  const params = new URLSearchParams({ date });
  return request<DailyTotals>(
    `/meals/totals?${params}`,
    "Não foi possível carregar o resumo do dia",
    { signal },
  );
}

export async function createMeal(input: MealInput): Promise<void> {
  await request("/meals", "Não foi possível criar a refeição", {
    method: "POST",
    body: toMealPayload(input),
  });
}

export async function updateMeal(mealId: number, input: MealInput): Promise<void> {
  await request(`/meals/${mealId}`, "Não foi possível atualizar a refeição", {
    method: "PUT",
    body: toMealPayload(input),
  });
}

export async function deleteMeal(mealId: number): Promise<void> {
  await request(`/meals/${mealId}`, "Não foi possível excluir a refeição", { method: "DELETE" });
}
