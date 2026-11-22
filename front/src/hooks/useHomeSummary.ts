import { countItems, getMostUsedItems } from "../services/itemService";
import { getDailyTotals, listMeals } from "../services/mealService";
import type { MostUsedItem } from "../types/Item";
import type { Meal } from "../types/Meal";
import { todayISODate } from "../utils/date";
import { toMacroTotals, type MacroTotals } from "../utils/nutrition";
import { useAsync } from "./useAsync";

const RECENT_MEALS_LIMIT = 4;
const MOST_USED_ITEMS_LIMIT = 5;
const NO_MEALS: Meal[] = [];
const NO_ITEMS: MostUsedItem[] = [];
const NO_TOTALS: MacroTotals = { calories: 0, protein: 0, carbohydrate: 0, fat: 0 };

function loadTodayTotals(signal: AbortSignal) {
  return getDailyTotals(todayISODate(), signal);
}

async function loadRecentMeals(signal: AbortSignal) {
  return (await listMeals({ page: 1, limit: RECENT_MEALS_LIMIT }, signal)).data;
}

function loadMostUsedItems(signal: AbortSignal) {
  return getMostUsedItems(MOST_USED_ITEMS_LIMIT, signal);
}

function loadItemCount(signal: AbortSignal) {
  return countItems(signal);
}

export function useHomeSummary() {
  const today = useAsync(loadTodayTotals);
  const recent = useAsync(loadRecentMeals);
  const mostUsed = useAsync(loadMostUsedItems);
  const itemCount = useAsync(loadItemCount);
  const parts = [today, recent, mostUsed, itemCount];

  return {
    todayMealCount: today.data?.mealCount ?? 0,
    todayTotals: today.data ? toMacroTotals(today.data) : NO_TOTALS,
    recentMeals: recent.data ?? NO_MEALS,
    mostUsedItems: mostUsed.data ?? NO_ITEMS,
    itemCount: itemCount.data,
    loading: parts.some((part) => part.loading),
    error: parts.find((part) => part.error)?.error ?? null,
  };
}
