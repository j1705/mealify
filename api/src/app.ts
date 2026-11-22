import CreateItemUseCase from "./application/usecase/item/CreateItem";
import DeleteItemUseCase from "./application/usecase/item/DeleteItem";
import GetItemUseCase from "./application/usecase/item/GetItem";
import GetItemsUseCase from "./application/usecase/item/GetItems";
import GetMostUsedItemsUseCase from "./application/usecase/item/GetMostUsedItems";
import UpdateItemUseCase from "./application/usecase/item/UpdateItem";
import CreateMealUseCase from "./application/usecase/meal/CreateMeal";
import DeleteMealUseCase from "./application/usecase/meal/DeleteMeal";
import GetDailyTotalsUseCase from "./application/usecase/meal/GetDailyTotals";
import GetMealUseCase from "./application/usecase/meal/GetMeal";
import GetMealsUseCase from "./application/usecase/meal/GetMeals";
import UpdateMealUseCase from "./application/usecase/meal/UpdateMeal";
import SystemClock from "./infra/clock/SystemClock";
import ItemController from "./infra/controller/ItemController";
import MealController from "./infra/controller/MealController";
import DatabaseConnection from "./infra/database/DatabaseConnection";
import HttpServer, { ExpressAdapter } from "./infra/http/HttpServer";
import ItemRepositoryDatabase from "./infra/repositoryDatabase/item/ItemRepositoryDatabase";
import MealRepositoryDatabase from "./infra/repositoryDatabase/meal/MealRepositoryDatabase";

export function buildApp(connection: DatabaseConnection, allowedOrigin?: string): HttpServer {
  const httpServer = new ExpressAdapter(allowedOrigin);
  const itemRepository = new ItemRepositoryDatabase(connection);
  const mealRepository = new MealRepositoryDatabase(connection);
  const clock = new SystemClock();

  new ItemController(
    httpServer,
    new CreateItemUseCase(itemRepository, clock),
    new GetItemsUseCase(itemRepository),
    new GetItemUseCase(itemRepository),
    new UpdateItemUseCase(itemRepository),
    new DeleteItemUseCase(itemRepository),
    new GetMostUsedItemsUseCase(itemRepository),
  );

  new MealController(
    httpServer,
    new CreateMealUseCase(mealRepository, itemRepository, clock),
    new GetMealsUseCase(mealRepository),
    new GetMealUseCase(mealRepository),
    new UpdateMealUseCase(mealRepository, itemRepository),
    new DeleteMealUseCase(mealRepository),
    new GetDailyTotalsUseCase(mealRepository),
  );

  return httpServer;
}
