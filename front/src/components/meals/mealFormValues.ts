import type { Meal, MealInput, MealItemInput } from "../../types/Meal";
import { formatDecimal, parseDecimal } from "../../utils/decimal";
import { isValidQuantity } from "../../utils/nutrition";

export type MealItemDraft = Omit<MealItemInput, "quantity"> & { quantity: string };

export type MealFormValues = Omit<MealInput, "items"> & { items: MealItemDraft[] };

const UNREADABLE_QUANTITY = 0;

export function toMealFormValues(meal: Meal): MealFormValues {
  return {
    name: meal.name,
    description: meal.description ?? "",
    date: meal.date,
    items: meal.items.map(({ itemId, quantity }) => ({
      itemId,
      quantity: formatDecimal(quantity),
    })),
  };
}

export function toMealItemInput({ itemId, quantity }: MealItemDraft): MealItemInput {
  return { itemId, quantity: parseDecimal(quantity) ?? UNREADABLE_QUANTITY };
}

export function toMealInput({ items, ...rest }: MealFormValues): MealInput {
  return { ...rest, items: items.map(toMealItemInput) };
}

export function isValidQuantityText(quantity: string): boolean {
  const parsed = parseDecimal(quantity);
  return parsed !== null && isValidQuantity(parsed);
}
