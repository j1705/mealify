import CreateMealUseCase from "../../../src/application/usecase/meal/CreateMeal";
import MealRepositoryMemory from "../../doubles/MealRepositoryMemory";
import { NotFoundError, ValidationError } from "../../../src/domain/error/DomainError";
import { createItemReaderWithFood } from "./mealFixtures";
import FixedClock from "../../doubles/FixedClock";

const now = new Date("2026-11-22T12:00:00.000Z");

describe("CreateMealUseCase", () => {
  let mealRepository: MealRepositoryMemory;
  let createMeal: CreateMealUseCase;
  let riceId: number;
  let eggId: number;

  beforeEach(() => {
    mealRepository = new MealRepositoryMemory();
    const fixtures = createItemReaderWithFood();
    ({ riceId, eggId } = fixtures);
    createMeal = new CreateMealUseCase(mealRepository, fixtures.itemReader, new FixedClock(now));
  });

  test("Should create a meal and return calculated calories and macronutrients", async () => {
    const output = await createMeal.execute({
      date: "2026-11-06",
      name: "Lunch",
      items: [
        { itemId: riceId, quantity: 150 },
        { itemId: eggId, quantity: 2 },
      ],
    });

    expect(output.message).toBe("Meal created!");
    expect(output.mealId).toBe(1);
    expect(output.calories).toBeCloseTo(335);
    expect(output.macronutrients.carbohydrate).toBeCloseTo(43.2);
    expect(output.macronutrients.protein).toBeCloseTo(16.05);
    expect(output.macronutrients.fat).toBeCloseTo(10.45);
    expect(output.items).toHaveLength(2);
    expect(output.items[0]).toMatchObject({ itemId: riceId, quantity: 150 });
    expect(output.items[0]?.calories).toBeCloseTo(195);
    expect(output.items[0]?.macronutrients.carbohydrate).toBeCloseTo(42);
    expect(output.items[0]?.macronutrients.protein).toBeCloseTo(4.05);
    expect(output.items[0]?.macronutrients.fat).toBeCloseTo(0.45);
    expect(output.items[1]?.calories).toBeCloseTo(140);
    expect(output.items[1]?.macronutrients.protein).toBeCloseTo(12);
    expect((await mealRepository.getMeals({ page: 1, limit: 20 })).total).toBe(1);
  });

  test("Should stamp the meal with the clock's current time", async () => {
    const { mealId } = await createMeal.execute({
      date: "2026-11-06",
      name: "Lunch",
      items: [{ itemId: riceId, quantity: 100 }],
    });

    expect((await mealRepository.getMealById(mealId))?.getCreatedAt()).toEqual(now);
  });

  test("Should allow meals with the same name", async () => {
    const input = { name: "Lunch", items: [{ itemId: riceId, quantity: 100 }] };
    await createMeal.execute({ ...input, date: "2026-11-05" });
    await createMeal.execute({ ...input, date: "2026-11-06" });

    expect((await mealRepository.getMeals({ page: 1, limit: 20 })).total).toBe(2);
  });

  test("Should throw if the date is invalid", async () => {
    await expect(
      createMeal.execute({
        date: "2026-02-30",
        name: "Lunch",
        items: [{ itemId: riceId, quantity: 100 }],
      }),
    ).rejects.toThrow(new ValidationError("Invalid date"));
  });

  test("Should reject an invalid quantity before looking up the items", async () => {
    await expect(
      createMeal.execute({
        date: "2026-11-06",
        name: "Lunch",
        items: [
          { itemId: 999, quantity: 100 },
          { itemId: riceId, quantity: 0 },
        ],
      }),
    ).rejects.toThrow(new ValidationError("Invalid quantity"));
  });

  test("Should throw if an item does not exist", async () => {
    await expect(
      createMeal.execute({
        date: "2026-11-06",
        name: "Lunch",
        items: [{ itemId: 999, quantity: 100 }],
      }),
    ).rejects.toThrow(NotFoundError);
    expect((await mealRepository.getMeals({ page: 1, limit: 20 })).total).toBe(0);
  });
});
