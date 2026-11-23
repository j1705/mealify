import MealRepository, { DailyTotals } from "../../src/application/repository/MealRepository";
import { MealListQuery } from "../../src/application/query/MealListQuery";
import Meal from "../../src/domain/entity/Meal";
import { MealNotFoundError } from "../../src/domain/error/DomainError";

export default class MealRepositoryMemory implements MealRepository {
  private meals: Meal[] = [];
  private nextId = 1;

  async saveMeal(meal: Meal): Promise<{ mealId: number }> {
    const mealId = this.nextId++;
    this.meals.push(withId(meal, mealId));
    return { mealId };
  }

  async getMealById(userId: number, mealId: number): Promise<Meal | null> {
    return this.mealsOf(userId).find((meal) => meal.getId() === mealId) ?? null;
  }

  async getMeals(
    userId: number,
    { page, limit, search, date }: MealListQuery,
  ): Promise<{ meals: Meal[]; total: number }> {
    const term = foldCaseAndAccents(search ?? "");
    const sorted = this.mealsOf(userId)
      .filter((meal) => foldCaseAndAccents(meal.getName()).includes(term))
      .filter((meal) => date === undefined || meal.getDate() === date)
      .sort((a, b) => b.getDate().localeCompare(a.getDate()) || b.getId()! - a.getId()!);
    return { meals: sorted.slice((page - 1) * limit, page * limit), total: sorted.length };
  }

  async getDailyTotals(userId: number, date: string): Promise<DailyTotals> {
    const meals = this.mealsOf(userId).filter((meal) => meal.getDate() === date);
    const total = (value: (meal: Meal) => number) =>
      meals.reduce((sum, meal) => sum + value(meal), 0);
    return {
      mealCount: meals.length,
      calories: total((meal) => meal.getCalories()),
      carbohydrate: total((meal) => meal.getMacronutrients().carbohydrate),
      protein: total((meal) => meal.getMacronutrients().protein),
      fat: total((meal) => meal.getMacronutrients().fat),
    };
  }

  async updateMeal(meal: Meal): Promise<{ mealId: number }> {
    const index = this.meals.findIndex(
      (existing) => existing.getId() === meal.getId() && existing.getUserId() === meal.getUserId(),
    );
    if (index === -1) throw new MealNotFoundError();
    this.meals[index] = meal;
    return { mealId: meal.getId()! };
  }

  async deleteMeal(userId: number, mealId: number): Promise<void> {
    this.meals = this.meals.filter(
      (meal) => meal.getId() !== mealId || meal.getUserId() !== userId,
    );
  }

  private mealsOf(userId: number): Meal[] {
    return this.meals.filter((meal) => meal.getUserId() === userId);
  }
}

function withId(meal: Meal, id: number): Meal {
  return new Meal({
    id,
    userId: meal.getUserId(),
    name: meal.getName(),
    description: meal.getDescription(),
    date: meal.getDate(),
    items: meal.getItems(),
    calories: meal.getCalories(),
    ...meal.getMacronutrients(),
    createdAt: meal.getCreatedAt(),
  });
}

function foldCaseAndAccents(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}
