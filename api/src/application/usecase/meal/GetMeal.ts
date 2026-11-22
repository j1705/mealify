import { MealNotFoundError } from "../../../domain/error/DomainError";
import { MealOutput, toMealOutput } from "../../mapper/MealOutputMapper";
import MealRepository from "../../repository/MealRepository";

export default class GetMealUseCase {
  constructor(readonly mealRepository: MealRepository) {}

  async execute(mealId: number): Promise<MealOutput> {
    const meal = await this.mealRepository.getMealById(mealId);
    if (!meal) throw new MealNotFoundError();
    return toMealOutput(meal);
  }
}
