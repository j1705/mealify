import CreateMealUseCase from "../../application/usecase/meal/CreateMeal";
import { MealInput } from "../../application/usecase/meal/MealInput";
import DeleteMealUseCase from "../../application/usecase/meal/DeleteMeal";
import GetDailyTotalsUseCase from "../../application/usecase/meal/GetDailyTotals";
import GetMealUseCase from "../../application/usecase/meal/GetMeal";
import GetMealsUseCase from "../../application/usecase/meal/GetMeals";
import UpdateMealUseCase from "../../application/usecase/meal/UpdateMeal";
import BadRequestError from "../http/BadRequestError";
import HandleDateFilter from "../http/HandleDateFilter";
import HandleId from "../http/HandleId";
import HandlePagination from "../http/HandlePagination";
import HandleSearch from "../http/HandleSearch";
import HttpServer from "../http/HttpServer";
import { isResourceId } from "../http/resourceId";

export default class MealController {
  constructor(
    readonly httpServer: HttpServer,
    readonly createMeal: CreateMealUseCase,
    readonly getMeals: GetMealsUseCase,
    readonly getMeal: GetMealUseCase,
    readonly updateMeal: UpdateMealUseCase,
    readonly deleteMeal: DeleteMealUseCase,
    readonly getDailyTotals: GetDailyTotalsUseCase,
  ) {
    httpServer.register(
      "post",
      "/meals",
      async ({ body }) => {
        validateItems((body as { items?: unknown } | null)?.items);
        return createMeal.execute(body as MealInput);
      },
      201,
    );
    httpServer.register("get", "/meals", async ({ query }) => {
      const pagination = new HandlePagination(query);
      const search = new HandleSearch(query.search);
      const date = new HandleDateFilter(query.date);
      return getMeals.execute({
        ...pagination.getValue(),
        search: search.getValue(),
        date: date.getValue(),
      });
    });
    httpServer.register("get", "/meals/totals", async ({ query }) => {
      const date = new HandleDateFilter(query.date).getValue();
      if (date === undefined) throw new BadRequestError("Date is required");
      return getDailyTotals.execute(date);
    });
    httpServer.register("get", "/meals/:mealId", async ({ params }) => {
      const mealId = new HandleId(params.mealId);
      return getMeal.execute(mealId.getValue());
    });
    httpServer.register("put", "/meals/:mealId", async ({ params, body }) => {
      const mealId = new HandleId(params.mealId);
      validateItems((body as { items?: unknown } | null)?.items);
      return updateMeal.execute(mealId.getValue(), body as MealInput);
    });
    httpServer.register("delete", "/meals/:mealId", async ({ params }) => {
      const mealId = new HandleId(params.mealId);
      return deleteMeal.execute(mealId.getValue());
    });
  }
}

function validateItems(items: unknown) {
  if (!Array.isArray(items)) throw new BadRequestError("Items must be an array");
  for (const item of items) {
    if (!isResourceId(item?.itemId)) throw new BadRequestError("Invalid item id");
    if (typeof item.quantity !== "number") throw new BadRequestError("Invalid item quantity");
  }
}
