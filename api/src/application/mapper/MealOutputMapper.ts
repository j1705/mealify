import Meal from "../../domain/entity/Meal";
import { NutrientsOutput } from "./NutrientsOutput";

export type MealItemOutput = NutrientsOutput & {
  itemId: number;
  name: string;
  unit: string;
  quantity: number;
};

export type MealMutationOutput = NutrientsOutput & {
  message: string;
  mealId: number;
  items: MealItemOutput[];
};

export type MealOutput = NutrientsOutput & {
  id: number;
  name: string;
  description: string | null;
  date: string;
  createdAt: Date;
  items: MealItemOutput[];
};

export function toNutrientsOutput(meal: Meal): NutrientsOutput {
  return { calories: meal.getCalories(), macronutrients: meal.getMacronutrients() };
}

export function toMealItemsOutput(meal: Meal): MealItemOutput[] {
  return meal.getItems().map((item) => ({
    itemId: item.getItemId(),
    name: item.getName(),
    unit: item.getUnit(),
    quantity: item.getQuantity(),
    calories: item.getCalories(),
    macronutrients: item.getMacronutrients(),
  }));
}

export function toMealOutput(meal: Meal): MealOutput {
  return {
    id: meal.getId()!,
    name: meal.getName(),
    description: meal.getDescription(),
    date: meal.getDate(),
    createdAt: meal.getCreatedAt(),
    ...toNutrientsOutput(meal),
    items: toMealItemsOutput(meal),
  };
}
