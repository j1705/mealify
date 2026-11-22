import { startTestApi, TestApi, uniqueSuffix } from "./testApi";

describe("Meals API", () => {
  let api: TestApi;
  let riceId: number;
  let eggId: number;
  const suffix = uniqueSuffix();

  beforeAll(async () => {
    api = await startTestApi();
    const rice = await api.request("POST", "/items", {
      name: `Rice ${suffix}`,
      unit: "g",
      calories: 128,
      protein: 2.5,
      carbohydrate: 28.1,
      fat: 0.2,
    });
    const egg = await api.request("POST", "/items", {
      name: `Egg ${suffix}`,
      unit: "unit",
      calories: 72,
      protein: 6.3,
      carbohydrate: 0.4,
      fat: 4.8,
    });
    riceId = rice.body.itemId;
    eggId = egg.body.itemId;
    api.trackItem(riceId);
    api.trackItem(eggId);
  });

  afterAll(async () => {
    await api.stop();
  });

  const validMeal = () => ({
    name: "Lunch",
    description: "Rice with egg",
    date: "2026-01-15",
    items: [
      { itemId: riceId, quantity: 150 },
      { itemId: eggId, quantity: 2 },
    ],
  });

  async function createMeal(body: unknown = validMeal()) {
    const response = await api.request("POST", "/meals", body);
    if (response.status === 201) api.trackMeal(response.body.mealId);
    return response;
  }

  test("POST /meals creates a meal with nutrients calculated per unit base", async () => {
    const created = await createMeal();
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ message: "Meal created!", mealId: expect.any(Number) });

    const { status, body } = await api.request("GET", `/meals/${created.body.mealId}`);
    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: created.body.mealId,
      name: "Lunch",
      description: "Rice with egg",
      date: "2026-01-15",
      createdAt: expect.any(String),
    });
    const ricePortions = 150 / 100;
    const eggUnits = 2;
    expect(body.calories).toBeCloseTo(128 * ricePortions + 72 * eggUnits);
    expect(body.macronutrients.protein).toBeCloseTo(2.5 * ricePortions + 6.3 * eggUnits);
    expect(body.items).toEqual([
      expect.objectContaining({
        itemId: riceId,
        name: `Rice ${suffix}`,
        unit: "g",
        quantity: 150,
      }),
      expect.objectContaining({ itemId: eggId, name: `Egg ${suffix}`, unit: "unit", quantity: 2 }),
    ]);
  });

  test("GET /meals lists meals with their items", async () => {
    const created = await createMeal({ ...validMeal(), name: `Listed ${suffix}` });

    const response = await api.request("GET", "/meals?limit=100");
    expect(response.status).toBe(200);
    const listed = response.body.data.find(
      (meal: { id: number }) => meal.id === created.body.mealId,
    );
    expect(listed).toMatchObject({ name: `Listed ${suffix}`, date: "2026-01-15" });
    expect(listed.items).toHaveLength(2);
  });

  test("GET /meals?search= filters by name ignoring case and accents, counting only matches", async () => {
    const lunch = await createMeal({ ...validMeal(), name: `Jalapeño lunch ${suffix}` });
    await createMeal({ ...validMeal(), name: `Plain dinner ${suffix}` });

    const response = await api.request(
      "GET",
      `/meals?search=${encodeURIComponent(`JALAPENO LUNCH ${suffix}`)}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data.map((meal: { id: number }) => meal.id)).toEqual([lunch.body.mealId]);
    expect(response.body.pagination.total).toBe(1);
  });

  test("GET /meals?date= lists only the meals of that day", async () => {
    const onTheDay = await createMeal({
      ...validMeal(),
      name: `Day ${suffix}`,
      date: "2996-03-10",
    });
    await createMeal({ ...validMeal(), name: `Other day ${suffix}`, date: "2996-03-11" });

    const response = await api.request("GET", "/meals?date=2996-03-10&limit=100");

    expect(response.status).toBe(200);
    const ids = response.body.data.map((meal: { id: number }) => meal.id);
    expect(ids).toContain(onTheDay.body.mealId);
    expect(response.body.data.every((meal: { date: string }) => meal.date === "2996-03-10")).toBe(
      true,
    );
  });

  test("GET /meals/totals?date= sums every meal of the day", async () => {
    await createMeal({ ...validMeal(), date: "2996-04-20" });
    await createMeal({ ...validMeal(), date: "2996-04-20" });
    await createMeal({ ...validMeal(), date: "2996-04-21" });
    const single = await api.request("POST", "/meals", { ...validMeal(), date: "2996-04-22" });
    api.trackMeal(single.body.mealId);

    const response = await api.request("GET", "/meals/totals?date=2996-04-20");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ date: "2996-04-20", mealCount: 2 });
    expect(response.body.calories).toBeCloseTo(single.body.calories * 2);
    expect(response.body.macronutrients.protein).toBeCloseTo(
      single.body.macronutrients.protein * 2,
    );
  });

  test.each([
    ["without a date", "/meals/totals", "Date is required"],
    ["for an impossible date", "/meals/totals?date=2026-02-30", "Invalid date filter"],
  ])("GET /meals/totals answers 400 %s", async (_case, path, message) => {
    const response = await api.request("GET", path);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message });
  });

  test.each([
    ["an impossible date", "/meals?date=2026-02-30", "Invalid date filter"],
    [
      "a search longer than 50 characters",
      `/meals?search=${"a".repeat(51)}`,
      "Search must be at most 50 characters",
    ],
  ])("GET /meals answers 400 for %s", async (_case, path, message) => {
    const response = await api.request("GET", path);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message });
  });

  test("PUT /meals/:id replaces items and date but keeps createdAt", async () => {
    const created = await createMeal();
    const id = created.body.mealId;
    const before = await api.request("GET", `/meals/${id}`);

    const updated = await api.request("PUT", `/meals/${id}`, {
      name: "Dinner",
      date: "2026-01-16",
      items: [{ itemId: eggId, quantity: 3 }],
    });
    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({ message: "Meal updated!", mealId: id });

    const after = await api.request("GET", `/meals/${id}`);
    expect(after.body).toMatchObject({ name: "Dinner", date: "2026-01-16", description: null });
    expect(after.body.items).toEqual([expect.objectContaining({ itemId: eggId, quantity: 3 })]);
    expect(after.body.calories).toBeCloseTo(72 * 3);
    expect(after.body.createdAt).toBe(before.body.createdAt);
  });

  test("DELETE /meals/:id removes the meal", async () => {
    const created = await createMeal();
    const id = created.body.mealId;

    const deleted = await api.request("DELETE", `/meals/${id}`);
    expect(deleted.status).toBe(200);
    expect(deleted.body).toEqual({ message: "Meal deleted!" });
    expect((await api.request("GET", `/meals/${id}`)).status).toBe(404);
  });

  test("POST /meals accepts two meals with the same name", async () => {
    expect((await createMeal({ ...validMeal(), name: `Same ${suffix}` })).status).toBe(201);
    expect((await createMeal({ ...validMeal(), name: `Same ${suffix}` })).status).toBe(201);
  });

  test.each([
    [0, 422, "Invalid quantity"],
    [-5, 422, "Invalid quantity"],
    ["100", 400, "Invalid item quantity"],
    [null, 400, "Invalid item quantity"],
  ])("POST /meals with quantity %p answers %i", async (quantity, status, message) => {
    const response = await createMeal({ ...validMeal(), items: [{ itemId: riceId, quantity }] });
    expect(response.status).toBe(status);
    expect(response.body).toEqual({ message });
  });

  test("POST /meals with an unknown item and quantity 0 answers 422 for the quantity", async () => {
    const response = await createMeal({
      ...validMeal(),
      items: [{ itemId: 2147483647, quantity: 0 }],
    });
    expect(response.status).toBe(422);
    expect(response.body).toEqual({ message: "Invalid quantity" });
  });

  test("PUT /meals/:id with quantity 0 answers 422 and keeps the meal", async () => {
    const id = (await createMeal()).body.mealId;

    const response = await api.request("PUT", `/meals/${id}`, {
      ...validMeal(),
      items: [{ itemId: eggId, quantity: 0 }],
    });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({ message: "Invalid quantity" });
    expect((await api.request("GET", `/meals/${id}`)).body.items).toHaveLength(2);
  });

  test.each([
    ["items missing", { items: undefined }, 400, "Items must be an array"],
    ["no items", { items: [] }, 422, "Meal must have at least one item"],
    ["invalid item id", { items: [{ itemId: "x", quantity: 1 }] }, 400, "Invalid item id"],
    ["unknown item", { items: [{ itemId: 2147483647, quantity: 1 }] }, 404, "Item not found"],
    ["date missing", { date: undefined }, 422, "Invalid date"],
    ["impossible date", { date: "2026-02-30" }, 422, "Invalid date"],
    ["name missing", { name: undefined }, 422, "Name is required."],
    ["description not a string", { description: 123 }, 422, "Description must be a string."],
  ])("POST /meals with %s answers %i", async (_case, overrides, status, message) => {
    const response = await createMeal({ ...validMeal(), ...overrides });
    expect(response.status).toBe(status);
    expect(response.body).toEqual({ message });
  });

  test.each([
    ["GET", "/meals/abc", 400],
    ["GET", "/meals/2147483647", 404],
    ["PUT", "/meals/2147483647", 404],
    ["DELETE", "/meals/2147483647", 404],
    ["GET", "/meals?limit=101", 400],
  ])("%s %s answers %i", async (method, path, status) => {
    const response = await api.request(method, path, method === "PUT" ? validMeal() : undefined);
    expect(response.status).toBe(status);
    expect(response.body).toEqual({ message: expect.any(String) });
  });
});
