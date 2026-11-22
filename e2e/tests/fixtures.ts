import { test as base, expect, type APIRequestContext } from "@playwright/test";
import { API_URL } from "../env";

type ItemInput = {
  name: string;
  unit: "g" | "ml" | "unit";
  calories: number;
  protein: number;
  carbohydrate: number;
  fat: number;
};

type MealInput = {
  name: string;
  description?: string;
  date: string;
  items: { itemId: number; quantity: number }[];
};

class TestData {
  private itemIds = new Set<number>();
  private mealIds = new Set<number>();
  readonly suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

  constructor(private readonly api: APIRequestContext) {}

  async createItem(input: ItemInput): Promise<number> {
    const response = await this.api.post("/items", { data: input });
    expect(response.status(), await response.text()).toBe(201);
    const { itemId } = await response.json();
    this.itemIds.add(itemId);
    return itemId;
  }

  async createMeal(input: MealInput): Promise<number> {
    const response = await this.api.post("/meals", { data: input });
    expect(response.status(), await response.text()).toBe(201);
    const { mealId } = await response.json();
    this.mealIds.add(mealId);
    return mealId;
  }

  async getMeal(mealId: number) {
    return this.api.get(`/meals/${mealId}`);
  }

  async findItemByName(name: string): Promise<{ id: number; calories: number } | undefined> {
    const { data } = await (await this.api.get("/items", { params: { search: name } })).json();
    const item = data.find((i: { name: string }) => i.name === name);
    if (item) this.itemIds.add(item.id);
    return item;
  }

  async findMealByName(name: string): Promise<{ id: number } | undefined> {
    const { data } = await (await this.api.get("/meals?limit=100")).json();
    const meal = data.find((m: { name: string }) => m.name === name);
    if (meal) this.mealIds.add(meal.id);
    return meal;
  }

  async cleanup() {
    const [meals, items] = await Promise.all([
      this.api.get("/meals?limit=100").then((r) => r.json()),
      this.api.get("/items", { params: { search: this.suffix, limit: 100 } }).then((r) => r.json()),
    ]);
    for (const meal of meals.data) if (meal.name.includes(this.suffix)) this.mealIds.add(meal.id);
    for (const item of items.data) if (item.name.includes(this.suffix)) this.itemIds.add(item.id);

    for (const id of this.mealIds) await this.api.delete(`/meals/${id}`);
    for (const id of this.itemIds) await this.api.delete(`/items/${id}`);
  }
}

export const test = base.extend<{ data: TestData }>({
  data: async ({ playwright }, use) => {
    const api = await playwright.request.newContext({ baseURL: API_URL });
    const data = new TestData(api);
    await use(data);
    await data.cleanup();
    await api.dispose();
  },
});

export { expect };
