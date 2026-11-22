import SystemClock from "../../../src/infra/clock/SystemClock";
import CreateMealUseCase from "../../../src/application/usecase/meal/CreateMeal";
import UpdateMealUseCase from "../../../src/application/usecase/meal/UpdateMeal";
import { ItemNotFoundError, MealNotFoundError } from "../../../src/domain/error/DomainError";
import MealRepositoryMemory from "../../doubles/MealRepositoryMemory";
import { createItemReaderWithFood } from "./mealFixtures";

describe("UpdateMealUseCase", () => {
  let mealRepository: MealRepositoryMemory;
  let createMeal: CreateMealUseCase;
  let updateMeal: UpdateMealUseCase;
  let riceId: number;
  let eggId: number;
  let lunchId: number;

  beforeEach(async () => {
    mealRepository = new MealRepositoryMemory();
    const fixtures = createItemReaderWithFood();
    ({ riceId, eggId } = fixtures);
    createMeal = new CreateMealUseCase(mealRepository, fixtures.itemReader, new SystemClock());
    updateMeal = new UpdateMealUseCase(mealRepository, fixtures.itemReader);
    ({ mealId: lunchId } = await createMeal.execute({
      date: "2026-11-06",
      name: "Lunch",
      items: [{ itemId: riceId, quantity: 100 }],
    }));
  });

  test("Should replace the items and recalculate the totals", async () => {
    const output = await updateMeal.execute(lunchId, {
      date: "2026-11-06",
      name: "Lunch",
      description: "Rice and eggs",
      items: [
        { itemId: riceId, quantity: 150 },
        { itemId: eggId, quantity: 2 },
      ],
    });

    expect(output.message).toBe("Meal updated!");
    expect(output.mealId).toBe(lunchId);
    expect(output.calories).toBeCloseTo(335);
    expect(output.macronutrients.carbohydrate).toBeCloseTo(43.2);
    expect(output.macronutrients.protein).toBeCloseTo(16.05);
    expect(output.macronutrients.fat).toBeCloseTo(10.45);
    expect(output.items).toHaveLength(2);
    expect(output.items[1]).toMatchObject({ itemId: eggId, quantity: 2, calories: 140 });

    const saved = await mealRepository.getMealById(lunchId);
    expect(saved?.getDescription()).toBe("Rice and eggs");
    expect(saved?.getItems()).toHaveLength(2);
  });

  test("Should change the meal date and keep the original creation timestamp", async () => {
    const before = (await mealRepository.getMealById(lunchId))!.getCreatedAt();

    await updateMeal.execute(lunchId, {
      date: "2026-11-01",
      name: "Lunch",
      items: [{ itemId: eggId, quantity: 1 }],
    });

    const saved = await mealRepository.getMealById(lunchId);
    expect(saved?.getDate()).toBe("2026-11-01");
    expect(saved?.getCreatedAt()).toBe(before);
  });

  test("Should allow using another meal's name", async () => {
    await createMeal.execute({
      date: "2026-11-06",
      name: "Dinner",
      items: [{ itemId: eggId, quantity: 1 }],
    });

    await expect(
      updateMeal.execute(lunchId, {
        date: "2026-11-06",
        name: "Dinner",
        items: [{ itemId: riceId, quantity: 50 }],
      }),
    ).resolves.toMatchObject({ mealId: lunchId });
  });

  test("Should throw if the meal does not exist", async () => {
    await expect(
      updateMeal.execute(999, {
        date: "2026-11-06",
        name: "Lunch",
        items: [{ itemId: riceId, quantity: 50 }],
      }),
    ).rejects.toThrow(MealNotFoundError);
  });

  test("Should throw if an item does not exist and keep the meal unchanged", async () => {
    await expect(
      updateMeal.execute(lunchId, {
        date: "2026-11-06",
        name: "Lunch",
        items: [{ itemId: 999, quantity: 50 }],
      }),
    ).rejects.toThrow(ItemNotFoundError);
    expect((await mealRepository.getMealById(lunchId))?.getCalories()).toBeCloseTo(130);
  });
});
