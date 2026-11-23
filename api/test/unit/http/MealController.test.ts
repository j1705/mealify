import AuthenticateUseCase from "../../../src/application/usecase/auth/Authenticate";
import { AuthenticationRequiredError } from "../../../src/domain/error/DomainError";
import BadRequestError from "../../../src/infra/http/BadRequestError";
import RequestAuthenticator from "../../../src/infra/http/RequestAuthenticator";
import SessionCookie, { SESSION_COOKIE_NAME } from "../../../src/infra/http/SessionCookie";
import CreateMealUseCase from "../../../src/application/usecase/meal/CreateMeal";
import DeleteMealUseCase from "../../../src/application/usecase/meal/DeleteMeal";
import GetDailyTotalsUseCase from "../../../src/application/usecase/meal/GetDailyTotals";
import GetMealUseCase from "../../../src/application/usecase/meal/GetMeal";
import GetMealsUseCase from "../../../src/application/usecase/meal/GetMeals";
import UpdateMealUseCase from "../../../src/application/usecase/meal/UpdateMeal";
import MealController from "../../../src/infra/controller/MealController";
import HttpServer, {
  HttpCallback,
  HttpParams,
  HttpQuery,
} from "../../../src/infra/http/HttpServer";

const USER_ID = 7;
const SESSION = { [SESSION_COOKIE_NAME]: "token" };

const authenticate = {
  execute: async (token: string | undefined) => {
    if (!token) throw new AuthenticationRequiredError();
    return USER_ID;
  },
} as unknown as AuthenticateUseCase;

describe("MealController", () => {
  let handlers: Record<string, HttpCallback>;
  let useCases: Record<
    "create" | "getAll" | "get" | "update" | "delete" | "dailyTotals",
    { execute: jest.Mock }
  >;
  const route = (key: string) => (params: HttpParams, body: unknown, query: HttpQuery) =>
    handlers[key]!({ params, body, query, cookies: SESSION });

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
      new RequestAuthenticator(authenticate, new SessionCookie(false)),
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
    expect(useCases.create.execute).toHaveBeenCalledWith(USER_ID, validBody);
  });

  test("GET /meals should use the default pagination", async () => {
    await route("get /meals")({}, null, {});
    expect(useCases.getAll.execute).toHaveBeenCalledWith(USER_ID, { page: 1, limit: 20 });
  });

  test("GET /meals should pass the requested pagination", async () => {
    await route("get /meals")({}, null, { page: "3", limit: "50" });
    expect(useCases.getAll.execute).toHaveBeenCalledWith(USER_ID, { page: 3, limit: 50 });
  });

  test("GET /meals should reject an invalid pagination", async () => {
    await expect(route("get /meals")({}, null, { limit: "101" })).rejects.toThrow(BadRequestError);
    expect(useCases.getAll.execute).not.toHaveBeenCalled();
  });

  test("GET /meals/:mealId should call the use case with the parsed id", async () => {
    await route("get /meals/:mealId")({ mealId: "7" }, null, {});
    expect(useCases.get.execute).toHaveBeenCalledWith(USER_ID, 7);
  });

  test("PUT /meals/:mealId should call the use case with the parsed id and body", async () => {
    await route("put /meals/:mealId")({ mealId: "7" }, validBody, {});
    expect(useCases.update.execute).toHaveBeenCalledWith(USER_ID, 7, validBody);
  });

  test("DELETE /meals/:mealId should call the use case with the parsed id", async () => {
    await route("delete /meals/:mealId")({ mealId: "7" }, null, {});
    expect(useCases.delete.execute).toHaveBeenCalledWith(USER_ID, 7);
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

  test("GET /meals/totals should ask the totals of the user for the date", async () => {
    await route("get /meals/totals")({}, null, { date: "2026-11-22" });
    expect(useCases.dailyTotals.execute).toHaveBeenCalledWith(USER_ID, "2026-11-22");
  });

  test.each([
    "post /meals",
    "get /meals",
    "get /meals/totals",
    "get /meals/:mealId",
    "put /meals/:mealId",
    "delete /meals/:mealId",
  ])("%s should refuse a request without a session", async (key) => {
    await expect(
      handlers[key]!({ params: { mealId: "7" }, body: validBody, query: {}, cookies: {} }),
    ).rejects.toThrow(AuthenticationRequiredError);
    Object.values(useCases).forEach((useCase) => expect(useCase.execute).not.toHaveBeenCalled());
  });
});
