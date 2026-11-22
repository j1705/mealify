import type { Macronutrients, Unit } from "./Nutrition";

export type MealItemInput = {
  itemId: number;
  quantity: number;
};

export type MealInput = {
  name: string;
  description: string;
  date: string;
  items: MealItemInput[];
};

export type MealItem = MealItemInput & {
  name: string;
  unit: Unit;
  calories: number;
  macronutrients: Macronutrients;
};

export type Meal = {
  id: number;
  name: string;
  description: string | null;
  date: string;
  createdAt: string;
  calories: number;
  macronutrients: Macronutrients;
  items: MealItem[];
};

export type DailyTotals = {
  date: string;
  mealCount: number;
  calories: number;
  macronutrients: Macronutrients;
};
