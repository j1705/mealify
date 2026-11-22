import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { useItem } from "../../src/hooks/useItem";
import { useMeal } from "../../src/hooks/useMeal";
import * as itemService from "../../src/services/itemService";
import * as mealService from "../../src/services/mealService";
import type { Item } from "../../src/types/Item";
import type { Meal } from "../../src/types/Meal";

const meal = { id: 7, name: "Lunch" } as Meal;
const item = { id: 3, name: "Rice" } as Item;

describe("useMeal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("loads the meal with the given id, passing the abort signal", async () => {
    const getMeal = vi.spyOn(mealService, "getMeal").mockResolvedValue(meal);

    const { result } = renderHook(() => useMeal(7));

    await waitFor(() => expect(result.current.data).toBe(meal));
    expect(getMeal).toHaveBeenCalledWith(7, expect.any(AbortSignal));
  });

  test("fails without calling the API when the id is invalid", async () => {
    const getMeal = vi.spyOn(mealService, "getMeal");

    const { result } = renderHook(() => useMeal(null));

    await waitFor(() => expect(result.current.error).toBe("Refeição não encontrada."));
    expect(getMeal).not.toHaveBeenCalled();
  });
});

describe("useItem", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("loads the item with the given id, passing the abort signal", async () => {
    const getItem = vi.spyOn(itemService, "getItem").mockResolvedValue(item);

    const { result } = renderHook(() => useItem(3));

    await waitFor(() => expect(result.current.data).toBe(item));
    expect(getItem).toHaveBeenCalledWith(3, expect.any(AbortSignal));
  });

  test("fails without calling the API when the id is invalid", async () => {
    const getItem = vi.spyOn(itemService, "getItem");

    const { result } = renderHook(() => useItem(null));

    await waitFor(() => expect(result.current.error).toBe("Item não encontrado."));
    expect(getItem).not.toHaveBeenCalled();
  });
});
