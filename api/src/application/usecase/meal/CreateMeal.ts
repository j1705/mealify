import Clock from "../../clock/Clock";
import Meal from "../../../domain/entity/Meal";
import { ItemReader } from "../../repository/ItemRepository";
import MealRepository from "../../repository/MealRepository";
import buildMealItems from "../../service/buildMealItems";
import {
  MealMutationOutput,
  toMealItemsOutput,
  toNutrientsOutput,
} from "../../mapper/MealOutputMapper";
import { MealInput } from "./MealInput";

export default class CreateMealUseCase {
  constructor(
    readonly mealRepository: MealRepository,
    readonly itemReader: ItemReader,
    readonly clock: Clock,
  ) {}

  async execute({ name, description, date, items }: MealInput): Promise<MealMutationOutput> {
    const mealItems = await buildMealItems(this.itemReader, items);
    const meal = Meal.create({ name, description, date, items: mealItems }, this.clock.now());
    const { mealId } = await this.mealRepository.saveMeal(meal);

    return {
      message: "Meal created!",
      mealId,
      ...toNutrientsOutput(meal),
      items: toMealItemsOutput(meal),
    };
  }
}
