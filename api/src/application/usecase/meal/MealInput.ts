import { InputMealItem } from "../../service/buildMealItems";

export type MealInput = {
  name: string;
  description?: string;
  date: string;
  items: InputMealItem[];
};
