import Meal from "../../domain/entity/Meal";
import { Nutrients } from "../../domain/service/calculateNutrients";
import { MealListQuery } from "../query/MealListQuery";

export type DailyTotals = Nutrients & { mealCount: number };

export default interface MealRepository {
  saveMeal(meal: Meal): Promise<{ mealId: number }>;
  getMealById(mealId: number): Promise<Meal | null>;
  getMeals(query: MealListQuery): Promise<{ meals: Meal[]; total: number }>;
  getDailyTotals(date: string): Promise<DailyTotals>;
  updateMeal(meal: Meal): Promise<{ mealId: number }>;
  deleteMeal(mealId: number): Promise<void>;
}
