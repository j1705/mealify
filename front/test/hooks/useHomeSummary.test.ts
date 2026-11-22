import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { useHomeSummary } from "../../src/hooks/useHomeSummary";
import * as itemService from "../../src/services/itemService";
import * as mealService from "../../src/services/mealService";
import type { Meal } from "../../src/types/Meal";
import { todayISODate } from "../../src/utils/date";

const todayTotals = {
  date: todayISODate(),
  mealCount: 3,
  calories: 1800,
  macronutrients: { protein: 120, carbohydrate: 200, fat: 60 },
};
const lunch = { id: 1, name: "Lunch" } as Meal;
const breakfast = { id: 2, name: "Breakfast" } as Meal;
const page = (data: Meal[]) => ({
  data,
  pagination: { page: 1, limit: 4, total: data.length, totalPages: 1 },
});

function stubServices() {
  const listMeals = vi.spyOn(mealService, "listMeals").mockResolvedValue(page([lunch, breakfast]));
  const getDailyTotals = vi.spyOn(mealService, "getDailyTotals").mockResolvedValue(todayTotals);
  const getMostUsedItems = vi
    .spyOn(itemService, "getMostUsedItems")
    .mockResolvedValue([{ id: 9, name: "Rice", unit: "g", mealCount: 3 }]);
  const countItems = vi.spyOn(itemService, "countItems").mockResolvedValue(36);
  return { listMeals, getDailyTotals, getMostUsedItems, countItems };
}

describe("useHomeSummary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("asks the API only for what the home page shows", async () => {
    const { listMeals, getDailyTotals, getMostUsedItems, countItems } = stubServices();

    const { result } = renderHook(() => useHomeSummary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getDailyTotals).toHaveBeenCalledWith(todayISODate(), expect.any(AbortSignal));
    expect(listMeals).toHaveBeenCalledOnce();
    expect(listMeals).toHaveBeenCalledWith({ page: 1, limit: 4 }, expect.any(AbortSignal));
    expect(getMostUsedItems).toHaveBeenCalledWith(5, expect.any(AbortSignal));
    expect(countItems).toHaveBeenCalledWith(expect.any(AbortSignal));
    expect(result.current).toMatchObject({
      todayMealCount: 3,
      todayTotals: { calories: 1800, protein: 120, carbohydrate: 200, fat: 60 },
      recentMeals: [lunch, breakfast],
      mostUsedItems: [{ id: 9, name: "Rice", unit: "g", mealCount: 3 }],
      itemCount: 36,
      error: null,
    });
  });

  test("is loading until every part has answered", () => {
    stubServices();
    vi.spyOn(itemService, "countItems").mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useHomeSummary());

    expect(result.current.loading).toBe(true);
  });

  test("exposes the first error", async () => {
    stubServices();
    vi.spyOn(itemService, "getMostUsedItems").mockRejectedValue(new Error("Falhou"));

    const { result } = renderHook(() => useHomeSummary());

    await waitFor(() => expect(result.current.error).toBe("Falhou"));
  });
});

describe("useHomeSummary before the totals arrive", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("starts with no meals today and zero totals", () => {
    stubServices();
    vi.spyOn(mealService, "getDailyTotals").mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useHomeSummary());

    expect(result.current.todayMealCount).toBe(0);
    expect(result.current.todayTotals).toEqual({
      calories: 0,
      protein: 0,
      carbohydrate: 0,
      fat: 0,
    });
  });
});
