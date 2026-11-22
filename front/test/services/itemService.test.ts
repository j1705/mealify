import { afterEach, describe, expect, test, vi } from "vitest";
import { API_URL } from "../../src/config";
import type { ItemInput } from "../../src/types/Item";
import {
  countItems,
  createItem,
  deleteItem,
  getMostUsedItems,
  listItems,
  updateItem,
} from "../../src/services/itemService";

function stubFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const rice: ItemInput = {
  name: "Rice",
  unit: "g",
  calories: 130,
  protein: 2.7,
  carbohydrate: 28,
  fat: 0.3,
};

const emptyPage = { data: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } };

describe("itemService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("lists the first page with the API maximum limit by default", async () => {
    const fetchMock = stubFetch(200, emptyPage);

    await listItems();

    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API_URL}/items?page=1&limit=100`);
  });

  test("sends the trimmed search, the page, the limit and the sort", async () => {
    const fetchMock = stubFetch(200, emptyPage);
    const controller = new AbortController();

    await listItems(
      { search: "  rice ", page: 2, limit: 8, sort: { field: "calories", order: "desc" } },
      controller.signal,
    );

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(`${API_URL}/items?page=2&limit=8&search=rice&sort=calories&order=desc`);
    expect(init).toMatchObject({ signal: controller.signal });
  });

  test("leaves a blank search out", async () => {
    const fetchMock = stubFetch(200, emptyPage);

    await listItems({ search: "   " });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API_URL}/items?page=1&limit=100`);
  });

  test("explains why an item cannot be deleted", async () => {
    stubFetch(409, { message: "Item is used in a meal" });

    await expect(deleteItem(1)).rejects.toThrow(
      "Este item está em uso em uma refeição e não pode ser excluído.",
    );
  });

  test.each([
    ["creates", () => createItem({ ...rice, name: "  Rice  " })],
    ["updates", () => updateItem(1, { ...rice, name: "  Rice  " })],
  ])("%s an item sending the trimmed name", async (_action, send) => {
    const fetchMock = stubFetch(200, { itemId: 1 });

    await send();

    const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string);
    expect(body).toEqual({ ...rice, name: "Rice" });
  });

  test("asks for the most used items", async () => {
    const fetchMock = stubFetch(200, { data: [{ id: 1, name: "Rice", unit: "g", mealCount: 3 }] });

    const items = await getMostUsedItems(5);

    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API_URL}/items/most-used?limit=5`);
    expect(items).toEqual([{ id: 1, name: "Rice", unit: "g", mealCount: 3 }]);
  });

  test("counts the registered items with a one-item page", async () => {
    const fetchMock = stubFetch(200, {
      ...emptyPage,
      pagination: { ...emptyPage.pagination, total: 36 },
    });

    expect(await countItems()).toBe(36);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API_URL}/items?page=1&limit=1`);
  });
});
