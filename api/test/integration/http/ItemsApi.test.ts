import { NO_SESSION, startTestApi, TestApi, uniqueSuffix } from "./testApi";

describe("Items API", () => {
  let api: TestApi;
  const suffix = uniqueSuffix();
  const chicken = {
    name: `Chicken ${suffix}`,
    unit: "g",
    calories: 159,
    protein: 32,
    carbohydrate: 0,
    fat: 2.5,
  };

  beforeAll(async () => {
    api = await startTestApi();
  });

  afterAll(async () => {
    await api.stop();
  });

  async function createItem(overrides: Partial<typeof chicken> = {}) {
    const response = await api.request("POST", "/items", { ...chicken, ...overrides });
    if (response.status === 201) api.trackItem(response.body.itemId);
    return response;
  }

  test("POST /items creates an item that GET /items/:id returns", async () => {
    const created = await createItem();
    expect(created.status).toBe(201);
    expect(created.body).toEqual({ message: "Item created!", itemId: expect.any(Number) });

    const fetched = await api.request("GET", `/items/${created.body.itemId}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body).toEqual({
      id: created.body.itemId,
      name: chicken.name,
      unit: "g",
      calories: 159,
      macronutrients: { carbohydrate: 0, protein: 32, fat: 2.5 },
    });
  });

  test("GET /items lists items with grouped numeric macronutrients and pagination", async () => {
    const created = await createItem({ name: `Listed ${suffix}` });

    const response = await api.request("GET", "/items?page=1&limit=100");
    expect(response.status).toBe(200);
    expect(response.body.pagination).toMatchObject({ page: 1, limit: 100 });
    const listed = response.body.data.find(
      (item: { id: number }) => item.id === created.body.itemId,
    );
    expect(listed).toEqual({
      id: created.body.itemId,
      name: `Listed ${suffix}`,
      unit: "g",
      calories: 159,
      macronutrients: { carbohydrate: 0, protein: 32, fat: 2.5 },
    });
  });

  test("GET /items?search= filters by name ignoring case and accents", async () => {
    const created = await createItem({ name: `Crème brûlée ${suffix}` });
    await createItem({ name: `Crepe ${suffix}` });

    const response = await api.request(
      "GET",
      `/items?search=${encodeURIComponent(`CREME BRULEE ${suffix}`)}`,
    );
    expect(response.status).toBe(200);
    expect(response.body.data.map((item: { id: number }) => item.id)).toEqual([
      created.body.itemId,
    ]);
    expect(response.body.pagination).toMatchObject({ total: 1, totalPages: 1 });
  });

  test("GET /items with a blank search lists everything", async () => {
    const all = await api.request("GET", "/items");
    const blank = await api.request("GET", "/items?search=%20%20");
    expect(blank.status).toBe(200);
    expect(blank.body.pagination.total).toBe(all.body.pagination.total);
  });

  test("GET /items sorts by the given field and order, then paginates", async () => {
    const tag = `Ordenado ${suffix}`;
    await createItem({ name: `${tag} B`, calories: 300 });
    await createItem({ name: `${tag} A`, calories: 100 });
    await createItem({ name: `${tag} C`, calories: 200 });
    const list = async (query: string) => {
      const response = await api.request(
        "GET",
        `/items?search=${encodeURIComponent(tag)}&${query}`,
      );
      expect(response.status).toBe(200);
      return response.body.data.map((item: { name: string }) => item.name.slice(-1));
    };

    expect(await list("sort=name")).toEqual(["A", "B", "C"]);
    expect(await list("sort=calories&order=desc")).toEqual(["B", "C", "A"]);
    expect(await list("sort=calories&order=desc&page=2&limit=1")).toEqual(["C"]);
    expect(await list("")).toEqual(["C", "A", "B"]);
  });

  test("PUT /items/:id updates the item", async () => {
    const created = await createItem({ name: `Antes ${suffix}` });
    const id = created.body.itemId;

    const updated = await api.request("PUT", `/items/${id}`, {
      ...chicken,
      name: `Depois ${suffix}`,
      calories: 200,
    });
    expect(updated.status).toBe(200);
    expect(updated.body).toEqual({ message: "Item updated!", itemId: id });

    const fetched = await api.request("GET", `/items/${id}`);
    expect(fetched.body).toMatchObject({ name: `Depois ${suffix}`, calories: 200 });
  });

  test("DELETE /items/:id removes the item", async () => {
    const created = await createItem({ name: `Apagar ${suffix}` });
    const id = created.body.itemId;

    const deleted = await api.request("DELETE", `/items/${id}`);
    expect(deleted.status).toBe(200);
    expect(deleted.body).toEqual({ message: "Item deleted!" });
    expect((await api.request("GET", `/items/${id}`)).status).toBe(404);
  });

  test("GET /items/most-used ranks items by the number of meals using them", async () => {
    const once = await createItem({ name: `Used once ${suffix}` });
    const twice = await createItem({ name: `Used twice ${suffix}` });
    for (const items of [
      [{ itemId: twice.body.itemId, quantity: 100 }],
      [
        { itemId: twice.body.itemId, quantity: 50 },
        { itemId: once.body.itemId, quantity: 50 },
      ],
    ]) {
      const meal = await api.request("POST", "/meals", {
        name: "Test meal",
        date: "2026-01-15",
        items,
      });
      api.trackMeal(meal.body.mealId);
    }

    const response = await api.request("GET", "/items/most-used?limit=20");

    expect(response.status).toBe(200);
    const ours = response.body.data.filter((item: { name: string }) => item.name.endsWith(suffix));
    expect(ours).toEqual([
      { id: twice.body.itemId, name: `Used twice ${suffix}`, unit: "g", mealCount: 2 },
      { id: once.body.itemId, name: `Used once ${suffix}`, unit: "g", mealCount: 1 },
    ]);
  });

  test("GET /items/most-used counts only the meals of the logged in user", async () => {
    const item = await createItem({ name: `Used by another user ${suffix}` });
    const other = await api.registerUser();
    const meal = await api.request(
      "POST",
      "/meals",
      {
        name: "Other's meal",
        date: "2026-01-15",
        items: [{ itemId: item.body.itemId, quantity: 10 }],
      },
      other.cookie,
    );
    api.trackMeal(meal.body.mealId);

    const mine = await api.request("GET", "/items/most-used?limit=20");
    const theirs = await api.request("GET", "/items/most-used?limit=20", undefined, other.cookie);

    const named = (body: { data: { id: number }[] }) =>
      body.data.filter(({ id }) => id === item.body.itemId);
    expect(named(mine.body)).toEqual([]);
    expect(named(theirs.body)).toEqual([expect.objectContaining({ mealCount: 1 })]);
  });

  test("GET /items/most-used answers 400 for a limit above 20", async () => {
    const response = await api.request("GET", "/items/most-used?limit=21");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Limit must be at most 20" });
  });

  test("DELETE /items/:id answers 409 when the item is used in a meal", async () => {
    const created = await createItem({ name: `In use ${suffix}` });
    const meal = await api.request("POST", "/meals", {
      name: "Test meal",
      date: "2026-01-15",
      items: [{ itemId: created.body.itemId, quantity: 100 }],
    });
    api.trackMeal(meal.body.mealId);

    const response = await api.request("DELETE", `/items/${created.body.itemId}`);
    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: "Item is used in a meal" });
  });

  test("POST /items answers 409 for a name already registered, ignoring case", async () => {
    await createItem({ name: `Repetido ${suffix}` });
    const response = await createItem({ name: `REPETIDO ${suffix}` });
    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: "Item already registered" });
  });

  test.each([
    ["name missing", { name: undefined }, "Name is required."],
    ["name too short", { name: "Ab" }, "Name must be at least 3 characters long."],
    ["invalid unit", { unit: "kg" }, "Invalid Unit"],
    ["unit as an array", { unit: ["g"] }, "Invalid Unit"],
    ["calories missing", { calories: undefined }, "Invalid Calories"],
    ["calories as text", { calories: "abc" }, "Invalid Calories"],
    ["negative protein", { protein: -1 }, "Invalid Protein"],
    ["fat missing", { fat: undefined }, "Invalid Fat"],
  ])("POST /items answers 422 when %s", async (_case, overrides, message) => {
    const response = await createItem(overrides as Partial<typeof chicken>);
    expect(response.status).toBe(422);
    expect(response.body).toEqual({ message });
  });

  test.each([
    ["GET", "/items/abc", 400],
    ["GET", "/items/0", 400],
    ["GET", "/items/2147483647", 404],
    ["GET", "/items/3000000000", 400],
    ["DELETE", "/items/3000000000", 400],
    ["PUT", "/items/2147483647", 404],
    ["DELETE", "/items/2147483647", 404],
    ["GET", "/items?limit=101", 400],
    ["GET", "/items?page=0", 400],
    ["GET", `/items?search=${"a".repeat(51)}`, 400],
    ["GET", "/items?sort=price", 400],
    ["GET", "/items?sort=name&order=up", 400],
    ["GET", "/items?order=up", 400],
  ])("%s %s answers %i", async (method, path, status) => {
    const response = await api.request(method, path, method === "PUT" ? chicken : undefined);
    expect(response.status).toBe(status);
    expect(response.body).toEqual({ message: expect.any(String) });
  });

  test.each([
    ["POST", "/items"],
    ["GET", "/items"],
    ["GET", "/items/most-used"],
    ["GET", "/items/1"],
    ["PUT", "/items/1"],
    ["DELETE", "/items/1"],
  ])("%s %s answers 401 without a session", async (method, path) => {
    const body = method === "GET" ? undefined : chicken;
    const response = await api.request(method, path, body, NO_SESSION);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Authentication required" });
  });
});
