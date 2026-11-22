import { MealNotFoundError } from "../../../domain/error/DomainError";
import MealRepository from "../../repository/MealRepository";

export default class DeleteMealUseCase {
  constructor(readonly mealRepository: MealRepository) {}

  async execute(mealId: number): Promise<OutputDeleteMeal> {
    const meal = await this.mealRepository.getMealById(mealId);
    if (!meal) throw new MealNotFoundError();
    await this.mealRepository.deleteMeal(mealId);
    return { message: "Meal deleted!" };
  }
}

type OutputDeleteMeal = {
  message: string;
};
