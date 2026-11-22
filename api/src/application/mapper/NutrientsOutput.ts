import { MacronutrientsValues } from "../../domain/vo/Macronutrients";

export type NutrientsOutput = {
  calories: number;
  macronutrients: MacronutrientsValues;
};
