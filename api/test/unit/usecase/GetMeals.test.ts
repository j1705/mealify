import SystemClock from "../../../src/infra/clock/SystemClock";
import CreateMealUseCase from "../../../src/application/usecase/meal/CreateMeal";
import GetMealsUseCase from "../../../src/application/usecase/meal/GetMeals";
import MealRepositoryMemory from "../../doubles/MealRepositoryMemory";
import { createItemRepositoryWithFood } from "./mealFixtures";

describe("GetMealsUseCase", () => {
  let mealRepository: MealRepositoryMemory;
  let getMeals: GetMealsUseCase;

  beforeEach(async () => {
    mealRepository = new MealRepositoryMemory();
    getMeals = new GetMealsUseCase(mealRepository);
    const { itemRepository, riceId, eggId } = await createItemRepositoryWithFood();
    const createMeal = new CreateMealUseCase(mealRepository, itemRepository, new SystemClock());
    await createMeal.execute({
      date: "2026-11-06",
      name: "Lunch",
      items: [{ itemId: riceId, quantity: 150 }],
    });
    await createMeal.execute({
      date: "2026-11-06",
      name: "Dinner",
      description: "Eggs",
      items: [{ itemId: eggId, quantity: 2 }],
    });
    await createMeal.execute({
      date: "2026-11-06",
      name: "Snack",
      items: [{ itemId: eggId, quantity: 1 }],
    });
  });

  test("Should filter by name and date, counting only the matches", async () => {
    const output = await getMeals.execute({
      page: 1,
      limit: 20,
      search: "NER",
      date: "2026-11-06",
    });

    expect(output.data.map((meal) => meal.name)).toEqual(["Dinner"]);
    expect(output.pagination.total).toBe(1);
  });

  test("Should return nothing for a day without meals", async () => {
    const output = await getMeals.execute({ page: 1, limit: 20, date: "2026-11-07" });

    expect(output.data).toEqual([]);
  });

  test("Should list meals newest first, with their items", async () => {
    const output = await getMeals.execute({ page: 1, limit: 20 });

    expect(output.data.map((meal) => meal.name)).toEqual(["Snack", "Dinner", "Lunch"]);
    expect(output.data[1]).toEqual({
      id: 2,
      name: "Dinner",
      description: "Eggs",
      date: "2026-11-06",
      createdAt: expect.any(Date),
      calories: 140,
      macronutrients: { carbohydrate: 1.2, protein: 12, fat: 10 },
      items: [
        {
          itemId: 2,
          name: "Egg",
          unit: "unit",
          quantity: 2,
          calories: 140,
          macronutrients: { carbohydrate: 1.2, protein: 12, fat: 10 },
        },
      ],
    });
    expect(output.data[2]?.description).toBeNull();
    expect(output.pagination).toEqual({ page: 1, limit: 20, total: 3, totalPages: 1 });
  });

  test("Should order by meal date before creation order", async () => {
    const { itemRepository, eggId } = await createItemRepositoryWithFood();
    await new CreateMealUseCase(mealRepository, itemRepository, new SystemClock()).execute({
      date: "2026-11-01",
      name: "Old dinner",
      items: [{ itemId: eggId, quantity: 1 }],
    });
    await new CreateMealUseCase(mealRepository, itemRepository, new SystemClock()).execute({
      date: "2026-11-07",
      name: "Tomorrow lunch",
      items: [{ itemId: eggId, quantity: 1 }],
    });

    const output = await getMeals.execute({ page: 1, limit: 20 });

    expect(output.data.map((meal) => meal.name)).toEqual([
      "Tomorrow lunch",
      "Snack",
      "Dinner",
      "Lunch",
      "Old dinner",
    ]);
  });

  test("Should return the requested page", async () => {
    const output = await getMeals.execute({ page: 2, limit: 2 });

    expect(output.data.map((meal) => meal.name)).toEqual(["Lunch"]);
    expect(output.pagination).toEqual({ page: 2, limit: 2, total: 3, totalPages: 2 });
  });

  test("Should return an empty page beyond the last one", async () => {
    const output = await getMeals.execute({ page: 5, limit: 2 });

    expect(output.data).toEqual([]);
    expect(output.pagination).toEqual({ page: 5, limit: 2, total: 3, totalPages: 2 });
  });

  test("Should return an empty list when there are no meals", async () => {
    const output = await new GetMealsUseCase(new MealRepositoryMemory()).execute({
      page: 1,
      limit: 20,
    });
    expect(output).toEqual({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
  });
});
