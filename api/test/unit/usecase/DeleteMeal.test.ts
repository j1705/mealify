import SystemClock from "../../../src/infra/clock/SystemClock";
import CreateMealUseCase from "../../../src/application/usecase/meal/CreateMeal";
import DeleteMealUseCase from "../../../src/application/usecase/meal/DeleteMeal";
import { MealNotFoundError } from "../../../src/domain/error/DomainError";
import MealRepositoryMemory from "../../doubles/MealRepositoryMemory";
import { createItemRepositoryWithFood } from "./mealFixtures";

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
    ).execute({
      date: "2026-11-06",
      name: "Lunch",
      items: [{ itemId: riceId, quantity: 150 }],
    }));
    deleteMeal = new DeleteMealUseCase(mealRepository);
  });

  test("Should delete a meal", async () => {
    expect(await deleteMeal.execute(lunchId)).toEqual({ message: "Meal deleted!" });
    expect(await mealRepository.getMealById(lunchId)).toBeNull();
  });

  test("Should throw if the meal does not exist", async () => {
    await expect(deleteMeal.execute(999)).rejects.toThrow(MealNotFoundError);
  });
});
