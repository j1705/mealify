import type { Macronutrients, Unit } from "./Nutrition";

export type Item = {
  id: number;
  name: string;
  unit: Unit;
  calories: number;
  macronutrients: Macronutrients;
};

export type ItemInput = Omit<Item, "id" | "macronutrients"> & Macronutrients;

export type ItemSort = {
  field: "name" | "calories" | "createdAt";
  order: "asc" | "desc";
};

export type MostUsedItem = {
  id: number;
  name: string;
  unit: Unit;
  mealCount: number;
};
