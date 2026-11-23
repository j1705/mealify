import Meal from "../../domain/entity/Meal";
import { Nutrients } from "../../domain/service/calculateNutrients";
import { MealListQuery } from "../query/MealListQuery";

export type DailyTotals = Nutrients & { mealCount: number };

export default interface MealRepository {
  saveMeal(meal: Meal): Promise<{ mealId: number }>;
  getMealById(userId: number, mealId: number): Promise<Meal | null>;
  getMeals(userId: number, query: MealListQuery): Promise<{ meals: Meal[]; total: number }>;
  getDailyTotals(userId: number, date: string): Promise<DailyTotals>;
  updateMeal(meal: Meal): Promise<{ mealId: number }>;
  deleteMeal(userId: number, mealId: number): Promise<void>;
}
