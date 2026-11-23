import GetMealUseCase from "../../../src/application/usecase/meal/GetMeal";
import Item from "../../../src/domain/entity/Item";
import Meal from "../../../src/domain/entity/Meal";
import MealRepositoryMemory from "../../doubles/MealRepositoryMemory";
import MealItem from "../../../src/domain/entity/MealItem";
import { NotFoundError } from "../../../src/domain/error/DomainError";

const USER_ID = 1;
const OTHER_USER_ID = 2;

describe("GetMealUseCase", () => {
  let mealRepository: MealRepositoryMemory;
  let getMeal: GetMealUseCase;

  beforeEach(() => {
    mealRepository = new MealRepositoryMemory();
    getMeal = new GetMealUseCase(mealRepository);
  });

  test("Should return a meal with its items and nutrients", async () => {
    const rice = new Item({
      id: 1,
      name: "Rice",
      unit: "g",
      calories: 130,
      carbohydrate: 28,
      protein: 2.7,
      fat: 0.3,
      createdAt: new Date(),
    });
    const { mealId } = await mealRepository.saveMeal(
      Meal.create(
        {
          userId: USER_ID,
          date: "2026-11-06",
          name: "Lunch",
          description: "Rice only",
          items: [MealItem.create(rice, 150)],
        },
        new Date(),
      ),
    );

    const output = await getMeal.execute(USER_ID, mealId);

    expect(output.id).toBe(mealId);
    expect(output.name).toBe("Lunch");
    expect(output.description).toBe("Rice only");
    expect(output.calories).toBeCloseTo(195);
    expect(output.macronutrients.carbohydrate).toBeCloseTo(42);
    expect(output.macronutrients.protein).toBeCloseTo(4.05);
    expect(output.macronutrients.fat).toBeCloseTo(0.45);
    expect(output.date).toBe("2026-11-06");
    expect(output.createdAt).toBeInstanceOf(Date);
    expect(output.items).toHaveLength(1);
    expect(output.items[0]).toMatchObject({ itemId: 1, name: "Rice", unit: "g", quantity: 150 });
    expect(output.items[0]?.calories).toBeCloseTo(195);
    expect(output.items[0]?.macronutrients.carbohydrate).toBeCloseTo(42);
  });

  test("Should throw if meal does not exist", async () => {
    await expect(getMeal.execute(USER_ID, 999)).rejects.toThrow(NotFoundError);
  });

  test("Should not find a meal of another user", async () => {
    const rice = new Item({
      id: 1,
      name: "Rice",
      unit: "g",
      calories: 130,
      carbohydrate: 28,
      protein: 2.7,
      fat: 0.3,
      createdAt: new Date(),
    });
    const { mealId } = await mealRepository.saveMeal(
      Meal.create(
        {
          userId: OTHER_USER_ID,
          date: "2026-11-06",
          name: "Lunch",
          items: [MealItem.create(rice, 150)],
        },
        new Date(),
      ),
    );

    await expect(getMeal.execute(USER_ID, mealId)).rejects.toThrow(NotFoundError);
  });
});
