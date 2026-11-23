import { MealNotFoundError } from "../../../domain/error/DomainError";
import MealRepository from "../../repository/MealRepository";

export default class DeleteMealUseCase {
  constructor(readonly mealRepository: MealRepository) {}

  async execute(userId: number, mealId: number): Promise<OutputDeleteMeal> {
    const meal = await this.mealRepository.getMealById(userId, mealId);
    if (!meal) throw new MealNotFoundError();
    await this.mealRepository.deleteMeal(userId, mealId);
    return { message: "Meal deleted!" };
  }
}

type OutputDeleteMeal = {
  message: string;
};
