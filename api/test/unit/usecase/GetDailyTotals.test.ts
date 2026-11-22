import GetDailyTotalsUseCase from "../../../src/application/usecase/meal/GetDailyTotals";
import CreateMealUseCase from "../../../src/application/usecase/meal/CreateMeal";
import MealRepositoryMemory from "../../doubles/MealRepositoryMemory";
import FixedClock from "../../doubles/FixedClock";
import { createItemReaderWithFood } from "./mealFixtures";

describe("GetDailyTotalsUseCase", () => {
  test("Should answer the day's meal count and nutrient totals", async () => {
    const mealRepository = new MealRepositoryMemory();
    const { itemReader, riceId, eggId } = createItemReaderWithFood();
    const createMeal = new CreateMealUseCase(
      mealRepository,
      itemReader,
      new FixedClock(new Date()),
    );
    await createMeal.execute({
      date: "2026-11-22",
      name: "Lunch",
      items: [{ itemId: riceId, quantity: 100 }],
    });
    await createMeal.execute({
      date: "2026-11-22",
      name: "Dinner",
      items: [{ itemId: eggId, quantity: 2 }],
    });
    await createMeal.execute({
      date: "2026-11-21",
      name: "Yesterday",
      items: [{ itemId: eggId, quantity: 1 }],
    });

    const output = await new GetDailyTotalsUseCase(mealRepository).execute("2026-11-22");

    expect(output).toMatchObject({ date: "2026-11-22", mealCount: 2 });
    expect(output.calories).toBeCloseTo(130 + 140);
    expect(output.macronutrients.carbohydrate).toBeCloseTo(28 + 1.2);
    expect(output.macronutrients.protein).toBeCloseTo(2.7 + 12);
    expect(output.macronutrients.fat).toBeCloseTo(0.3 + 10);
  });
});
