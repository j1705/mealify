import { afterEach, describe, expect, test, vi } from "vitest";
import { API_URL } from "../../src/config";
import { createMeal, getDailyTotals, listMeals, updateMeal } from "../../src/services/mealService";

const emptyPage = { data: [], pagination: { page: 1, limit: 8, total: 0, totalPages: 0 } };

const lunch = {
  name: "Lunch",
  description: "Post-workout",
  date: "2026-11-21",
  items: [{ itemId: 1, quantity: 100 }],
};

describe("mealService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test.each([
    ["creates", () => createMeal({ ...lunch, name: "  Lunch  ", description: " Post-workout " })],
    [
      "updates",
      () => updateMeal(1, { ...lunch, name: "  Lunch  ", description: " Post-workout " }),
    ],
  ])("%s a meal sending the trimmed name and description", async (_action, send) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ mealId: 1 })));
    vi.stubGlobal("fetch", fetchMock);

    await send();

    const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string);
    expect(body).toEqual(lunch);
  });

  test.each([
    ["creates", () => createMeal({ ...lunch, description: "   " })],
    ["updates", () => updateMeal(1, { ...lunch, description: "   " })],
  ])("%s a meal leaving a blank description out", async (_action, send) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ mealId: 1 })));
    vi.stubGlobal("fetch", fetchMock);

    await send();

    const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string);
    expect(body).not.toHaveProperty("description");
  });

  test("lists a page of meals filtered by the trimmed search and the date", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(emptyPage)));
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();

    await listMeals(
      { search: " lunch ", page: 2, limit: 8, date: "2026-11-21" },
      controller.signal,
    );

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(`${API_URL}/meals?page=2&limit=8&search=lunch&date=2026-11-21`);
    expect(init).toMatchObject({ signal: controller.signal });
  });

  test("asks the API for the totals of a day", async () => {
    const totals = {
      date: "2026-11-22",
      mealCount: 3,
      calories: 1800,
      macronutrients: { protein: 120, carbohydrate: 200, fat: 60 },
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(totals)));
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();

    const answer = await getDailyTotals("2026-11-22", controller.signal);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(`${API_URL}/meals/totals?date=2026-11-22`);
    expect(init).toMatchObject({ signal: controller.signal });
    expect(answer).toEqual(totals);
  });

  test("leaves blank filters out", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(emptyPage)));
    vi.stubGlobal("fetch", fetchMock);

    await listMeals({ search: "  ", page: 1, limit: 4 });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API_URL}/meals?page=1&limit=4`);
  });
});
