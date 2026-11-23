import SystemClock from "../../../src/infra/clock/SystemClock";
import CreateMealUseCase from "../../../src/application/usecase/meal/CreateMeal";
import DeleteMealUseCase from "../../../src/application/usecase/meal/DeleteMeal";
import { MealNotFoundError } from "../../../src/domain/error/DomainError";
import MealRepositoryMemory from "../../doubles/MealRepositoryMemory";
import { createItemRepositoryWithFood } from "./mealFixtures";

const USER_ID = 1;
const OTHER_USER_ID = 2;

describe("DeleteMealUseCase", () => {
  let mealRepository: MealRepositoryMemory;
  let deleteMeal: DeleteMealUseCase;
  let lunchId: number;

  beforeEach(async () => {
    mealRepository = new MealRepositoryMemory();
    const { itemRepository, riceId } = await createItemRepositoryWithFood();
    ({ mealId: lunchId } = await new CreateMealUseCase(
      mealRepository,
      itemRepository,
      new SystemClock(),
    ).execute(USER_ID, {
      date: "2026-11-06",
      name: "Lunch",
      items: [{ itemId: riceId, quantity: 150 }],
    }));
    deleteMeal = new DeleteMealUseCase(mealRepository);
  });

  test("Should delete a meal", async () => {
    expect(await deleteMeal.execute(USER_ID, lunchId)).toEqual({ message: "Meal deleted!" });
    expect(await mealRepository.getMealById(USER_ID, lunchId)).toBeNull();
  });

  test("Should throw if the meal does not exist", async () => {
    await expect(deleteMeal.execute(USER_ID, 999)).rejects.toThrow(MealNotFoundError);
  });

  test("Should not delete a meal of another user", async () => {
    await expect(deleteMeal.execute(OTHER_USER_ID, lunchId)).rejects.toThrow(MealNotFoundError);
    expect(await mealRepository.getMealById(USER_ID, lunchId)).not.toBeNull();
  });
});
