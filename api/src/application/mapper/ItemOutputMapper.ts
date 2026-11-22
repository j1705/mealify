import Item from "../../domain/entity/Item";
import { NutrientsOutput } from "./NutrientsOutput";

export type ItemOutput = NutrientsOutput & {
  id: number;
  name: string;
  unit: string;
};

export function toItemOutput(item: Item): ItemOutput {
  return {
    id: item.getId()!,
    name: item.getName(),
    unit: item.getUnit(),
    calories: item.getCalories(),
    macronutrients: item.getMacronutrients(),
  };
}
