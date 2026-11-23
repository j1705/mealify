import { MealOutput, toMealOutput } from "../../mapper/MealOutputMapper";
import { PaginatedOutput, toPaginatedOutput } from "../../mapper/PaginationMapper";
import { MealListQuery } from "../../query/MealListQuery";
import MealRepository from "../../repository/MealRepository";

export default class GetMealsUseCase {
  constructor(readonly mealRepository: MealRepository) {}

  async execute(userId: number, query: MealListQuery): Promise<PaginatedOutput<MealOutput>> {
    const { meals, total } = await this.mealRepository.getMeals(userId, query);
    return toPaginatedOutput(meals.map(toMealOutput), total, query);
  }
}
