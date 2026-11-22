import Item from "../entity/Item";
import { MacronutrientsValues } from "../vo/Macronutrients";

export type Nutrients = MacronutrientsValues & { calories: number };

export default function calculateNutrients(item: Item, quantity: number): Nutrients {
  const proportion = quantity / item.getUnitBase();
  const { carbohydrate, protein, fat } = item.getMacronutrients();
  return {
    calories: item.getCalories() * proportion,
    carbohydrate: carbohydrate * proportion,
    protein: protein * proportion,
    fat: fat * proportion,
  };
}
