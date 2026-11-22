import BadRequestError from "../../../src/infra/http/BadRequestError";
import CreateMealUseCase from "../../../src/application/usecase/meal/CreateMeal";
import DeleteMealUseCase from "../../../src/application/usecase/meal/DeleteMeal";
import GetDailyTotalsUseCase from "../../../src/application/usecase/meal/GetDailyTotals";
import GetMealUseCase from "../../../src/application/usecase/meal/GetMeal";
import GetMealsUseCase from "../../../src/application/usecase/meal/GetMeals";
import UpdateMealUseCase from "../../../src/application/usecase/meal/UpdateMeal";
import MealController from "../../../src/infra/controller/MealController";
import HttpServer, { HttpCallback } from "../../../src/infra/http/HttpServer";

describe("MealController", () => {
  let handlers: Record<string, HttpCallback>;
  let useCases: Record<
    "create" | "getAll" | "get" | "update" | "delete" | "dailyTotals",
    { execute: jest.Mock }
  >;
  const route = (key: string) => handlers[key]!;

  beforeEach(() => {
    handlers = {};
    const httpServer: HttpServer = {
      register: (method, url, callback) => {
        handlers[`${method} ${url}`] = callback;
      },
      listen: jest.fn(),
    };
    useCases = {
      create: { execute: jest.fn() },
      getAll: { execute: jest.fn() },
      get: { execute: jest.fn() },
      update: { execute: jest.fn() },
      delete: { execute: jest.fn() },
      dailyTotals: { execute: jest.fn() },
    };
    new MealController(
      httpServer,
      useCases.create as unknown as CreateMealUseCase,
      useCases.getAll as unknown as GetMealsUseCase,
      useCases.get as unknown as GetMealUseCase,
      useCases.update as unknown as UpdateMealUseCase,
      useCases.delete as unknown as DeleteMealUseCase,
      useCases.dailyTotals as unknown as GetDailyTotalsUseCase,
    );
  });

  const validBody = { name: "Lunch", items: [{ itemId: 1, quantity: 150 }] };

  describe.each([
    ["post /meals", {}, "create"],
    ["put /meals/:mealId", { mealId: "1" }, "update"],
  ] as const)("%s body validation", (key, params, useCase) => {
    test.each([["test"], [undefined], [null], [{}]])(
      "Should reject items that are not an array: %p",
      async (items) => {
        await expect(route(key)(params, { name: "Lunch", items }, {})).rejects.toThrow(
          new BadRequestError("Items must be an array"),
        );
        expect(useCases[useCase].execute).not.toHaveBeenCalled();
      },
    );

    test.each([
      ["test"],
      [{ quantity: 1 }],
      [{ itemId: "1", quantity: 1 }],
      [{ itemId: 0, quantity: 1 }],
      [{ itemId: 2147483648, quantity: 1 }],
    ])("Should reject an invalid item id: %p", async (item) => {
      await expect(route(key)(params, { name: "Lunch", items: [item] }, {})).rejects.toThrow(
        new BadRequestError("Invalid item id"),
      );
      expect(useCases[useCase].execute).not.toHaveBeenCalled();
    });

    test.each([[{ itemId: 1 }], [{ itemId: 1, quantity: "1" }], [{ itemId: 1, quantity: null }]])(
      "Should reject a quantity that is not a number: %p",
      async (item) => {
        await expect(route(key)(params, { name: "Lunch", items: [item] }, {})).rejects.toThrow(
          new BadRequestError("Invalid item quantity"),
        );
        expect(useCases[useCase].execute).not.toHaveBeenCalled();
      },
    );

    test.each([[0], [-1]])("Should leave the quantity rule to the domain: %p", async (quantity) => {
      await route(key)(params, { name: "Lunch", items: [{ itemId: 1, quantity }] }, {});
      expect(useCases[useCase].execute).toHaveBeenCalledTimes(1);
    });
  });

  test("POST /meals should call the use case with a valid body", async () => {
    await route("post /meals")({}, validBody, {});
    expect(useCases.create.execute).toHaveBeenCalledWith(validBody);
  });

  test("GET /meals should use the default pagination", async () => {
    await route("get /meals")({}, null, {});
    expect(useCases.getAll.execute).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  test("GET /meals should pass the requested pagination", async () => {
    await route("get /meals")({}, null, { page: "3", limit: "50" });
    expect(useCases.getAll.execute).toHaveBeenCalledWith({ page: 3, limit: 50 });
  });

  test("GET /meals should reject an invalid pagination", async () => {
    await expect(route("get /meals")({}, null, { limit: "101" })).rejects.toThrow(BadRequestError);
    expect(useCases.getAll.execute).not.toHaveBeenCalled();
  });

  test("GET /meals/:mealId should call the use case with the parsed id", async () => {
    await route("get /meals/:mealId")({ mealId: "7" }, null, {});
    expect(useCases.get.execute).toHaveBeenCalledWith(7);
  });

  test("PUT /meals/:mealId should call the use case with the parsed id and body", async () => {
    await route("put /meals/:mealId")({ mealId: "7" }, validBody, {});
    expect(useCases.update.execute).toHaveBeenCalledWith(7, validBody);
  });

  test("DELETE /meals/:mealId should call the use case with the parsed id", async () => {
    await route("delete /meals/:mealId")({ mealId: "7" }, null, {});
    expect(useCases.delete.execute).toHaveBeenCalledWith(7);
  });

  describe.each([
    ["get /meals/:mealId", "get"],
    ["put /meals/:mealId", "update"],
    ["delete /meals/:mealId", "delete"],
  ] as const)("%s id validation", (key, useCase) => {
    test.each([["0"], ["abc"], ["-1"]])("Should reject an invalid meal id: %p", async (mealId) => {
      await expect(route(key)({ mealId }, validBody, {})).rejects.toThrow(
        new BadRequestError("Id invalid"),
      );
      expect(useCases[useCase].execute).not.toHaveBeenCalled();
    });
  });
});
