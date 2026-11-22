import type { Item, ItemInput } from "../../types/Item";
import { formatDecimal, parseDecimal } from "../../utils/decimal";

export const NUTRIENT_FIELDS = ["calories", "protein", "carbohydrate", "fat"] as const;

type NutrientField = (typeof NUTRIENT_FIELDS)[number];

export type ItemFormValues = Omit<ItemInput, NutrientField> & Record<NutrientField, string>;

export const EMPTY_ITEM_FORM_VALUES: ItemFormValues = {
  name: "",
  unit: "g",
  calories: "",
  protein: "",
  carbohydrate: "",
  fat: "",
};

export function toItemFormValues({ name, unit, calories, macronutrients }: Item): ItemFormValues {
  return {
    name,
    unit,
    calories: formatDecimal(calories),
    protein: formatDecimal(macronutrients.protein),
    carbohydrate: formatDecimal(macronutrients.carbohydrate),
    fat: formatDecimal(macronutrients.fat),
  };
}

export function toItemInput(values: ItemFormValues): ItemInput {
  const nutrientOf = (field: NutrientField) => parseDecimal(values[field]) ?? 0;
  return {
    name: values.name,
    unit: values.unit,
    calories: nutrientOf("calories"),
    protein: nutrientOf("protein"),
    carbohydrate: nutrientOf("carbohydrate"),
    fat: nutrientOf("fat"),
  };
}
