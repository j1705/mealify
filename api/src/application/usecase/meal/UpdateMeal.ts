import { MealNotFoundError } from "../../../domain/error/DomainError";
import { ItemReader } from "../../repository/ItemRepository";
import MealRepository from "../../repository/MealRepository";
import buildMealItems from "../../service/buildMealItems";
import {
  MealMutationOutput,
  toMealItemsOutput,
  toNutrientsOutput,
} from "../../mapper/MealOutputMapper";
import { MealInput } from "./MealInput";

export default class UpdateMealUseCase {
  constructor(
    readonly mealRepository: MealRepository,
    readonly itemReader: ItemReader,
  ) {}

  async execute(
    mealId: number,
    { name, description, date, items }: MealInput,
  ): Promise<MealMutationOutput> {
    const existingMeal = await this.mealRepository.getMealById(mealId);
    if (!existingMeal) throw new MealNotFoundError();

    const mealItems = await buildMealItems(this.itemReader, items);
    const meal = existingMeal.update({
      name,
      description,
      date,
      items: mealItems,
    });
    await this.mealRepository.updateMeal(meal);

    return {
      message: "Meal updated!",
      mealId,
      ...toNutrientsOutput(meal),
      items: toMealItemsOutput(meal),
    };
  }
}
