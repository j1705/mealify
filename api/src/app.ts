import AuthenticateUseCase from "./application/usecase/auth/Authenticate";
import GetCurrentUserUseCase from "./application/usecase/auth/GetCurrentUser";
import LoginUseCase from "./application/usecase/auth/Login";
import LogoutUseCase from "./application/usecase/auth/Logout";
import RegisterUserUseCase from "./application/usecase/auth/RegisterUser";
import SessionStarter from "./application/service/SessionStarter";
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
import CryptoSessionTokens from "./infra/auth/CryptoSessionTokens";
import ScryptPasswordHasher from "./infra/auth/ScryptPasswordHasher";
import SystemClock from "./infra/clock/SystemClock";
import AuthController from "./infra/controller/AuthController";
import ItemController from "./infra/controller/ItemController";
import MealController from "./infra/controller/MealController";
import DatabaseConnection from "./infra/database/DatabaseConnection";
import HttpServer, { ExpressAdapter } from "./infra/http/HttpServer";
import RequestAuthenticator from "./infra/http/RequestAuthenticator";
import SessionCookie from "./infra/http/SessionCookie";
import ItemRepositoryDatabase from "./infra/repositoryDatabase/item/ItemRepositoryDatabase";
import MealRepositoryDatabase from "./infra/repositoryDatabase/meal/MealRepositoryDatabase";
import SessionRepositoryDatabase from "./infra/repositoryDatabase/session/SessionRepositoryDatabase";
import UserRepositoryDatabase from "./infra/repositoryDatabase/user/UserRepositoryDatabase";

export type AppOptions = {
  corsOrigin?: string;
  secureCookies?: boolean;
};

export function buildApp(
  connection: DatabaseConnection,
  { corsOrigin, secureCookies = false }: AppOptions = {},
): HttpServer {
  const httpServer = new ExpressAdapter(corsOrigin);
  const itemRepository = new ItemRepositoryDatabase(connection);
  const mealRepository = new MealRepositoryDatabase(connection);
  const userRepository = new UserRepositoryDatabase(connection);
  const sessionRepository = new SessionRepositoryDatabase(connection);
  const clock = new SystemClock();
  const passwordHasher = new ScryptPasswordHasher();
  const sessionTokens = new CryptoSessionTokens();
  const sessionStarter = new SessionStarter(sessionRepository, sessionTokens, clock);
  const sessionCookie = new SessionCookie(secureCookies);
  const authenticator = new RequestAuthenticator(
    new AuthenticateUseCase(sessionRepository, sessionTokens, clock),
    sessionCookie,
  );

  new AuthController(
    httpServer,
    new RegisterUserUseCase(userRepository, passwordHasher, sessionStarter, clock),
    new LoginUseCase(userRepository, passwordHasher, sessionStarter),
    new LogoutUseCase(sessionRepository, sessionTokens),
    authenticator,
    new GetCurrentUserUseCase(userRepository),
    sessionCookie,
  );

  new ItemController(
    httpServer,
    authenticator,
    new CreateItemUseCase(itemRepository, clock),
    new GetItemsUseCase(itemRepository),
    new GetItemUseCase(itemRepository),
    new UpdateItemUseCase(itemRepository),
    new DeleteItemUseCase(itemRepository),
    new GetMostUsedItemsUseCase(itemRepository),
  );

  new MealController(
    httpServer,
    authenticator,
    new CreateMealUseCase(mealRepository, itemRepository, clock),
    new GetMealsUseCase(mealRepository),
    new GetMealUseCase(mealRepository),
    new UpdateMealUseCase(mealRepository, itemRepository),
    new DeleteMealUseCase(mealRepository),
    new GetDailyTotalsUseCase(mealRepository),
  );

  return httpServer;
}
