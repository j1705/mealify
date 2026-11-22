import { NutrientsOutput } from "../../mapper/NutrientsOutput";
import MealRepository from "../../repository/MealRepository";

export type DailyTotalsOutput = NutrientsOutput & { date: string; mealCount: number };

export default class GetDailyTotalsUseCase {
  constructor(readonly mealRepository: MealRepository) {}

  async execute(date: string): Promise<DailyTotalsOutput> {
    const { mealCount, calories, carbohydrate, protein, fat } =
      await this.mealRepository.getDailyTotals(date);
    return { date, mealCount, calories, macronutrients: { carbohydrate, protein, fat } };
  }
}
