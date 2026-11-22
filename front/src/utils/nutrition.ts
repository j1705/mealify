import type { Item } from "../types/Item";
import type { Unit } from "../types/Nutrition";
import type { MealItemInput } from "../types/Meal";
import { MACRO_SVG_COLORS } from "./colors";

export const UNIT_LABELS: Record<Unit, string> = {
  g: "g",
  ml: "ml",
  unit: "unidade",
};

const NUTRIENT_BASE_BY_UNIT: Record<Unit, number> = { g: 100, ml: 100, unit: 1 };

export function isUnit(value: string): value is Unit {
  return Object.hasOwn(UNIT_LABELS, value);
}

export function unitBase(unit: Unit): number {
  return NUTRIENT_BASE_BY_UNIT[unit];
}

export function unitLabel(unit: Unit): string {
  return UNIT_LABELS[unit];
}

export function nutritionBasis(unit: Unit): string {
  return unit === "unit" ? UNIT_LABELS.unit : `${unitBase(unit)}${unit}`;
}

export function nutritionBasisLabel(unit: Unit): string {
  return `por ${nutritionBasis(unit)}`;
}

export function scaleByQuantity(valuePerBase: number, quantity: number, unit: Unit): number {
  return valuePerBase * (quantity / unitBase(unit));
}

export function formatNumber(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatGrams(value: number): string {
  return `${formatNumber(value)}g`;
}

export function formatKcal(value: number): string {
  return `${Math.round(value)} kcal`;
}

const KCAL_PER_GRAM = { protein: 4, carbohydrate: 4, fat: 9 };

export type MacroTotals = {
  calories: number;
  protein: number;
  carbohydrate: number;
  fat: number;
};

export function toMacroTotals(nutrients: {
  calories: number;
  macronutrients: { protein: number; carbohydrate: number; fat: number };
}): MacroTotals {
  return { calories: nutrients.calories, ...nutrients.macronutrients };
}

export type MacroPercentages = {
  protein: number;
  carbohydrate: number;
  fat: number;
};

export function macroPercentages(totals: MacroTotals): MacroPercentages {
  if (totals.calories <= 0) return { protein: 0, carbohydrate: 0, fat: 0 };
  const proteinKcal = totals.protein * KCAL_PER_GRAM.protein;
  const carbKcal = totals.carbohydrate * KCAL_PER_GRAM.carbohydrate;
  const fatKcal = totals.fat * KCAL_PER_GRAM.fat;
  const macroKcal = proteinKcal + carbKcal + fatKcal || 1;
  return {
    protein: Math.round((proteinKcal / macroKcal) * 100),
    carbohydrate: Math.round((carbKcal / macroKcal) * 100),
    fat: Math.round((fatKcal / macroKcal) * 100),
  };
}

export function macroSegments(percentages: MacroPercentages) {
  return [
    { label: "Proteínas", percent: percentages.protein, color: MACRO_SVG_COLORS.protein },
    {
      label: "Carboidratos",
      percent: percentages.carbohydrate,
      color: MACRO_SVG_COLORS.carbohydrate,
    },
    { label: "Gorduras", percent: percentages.fat, color: MACRO_SVG_COLORS.fat },
  ];
}

export type MealItemBreakdown = {
  itemId: number;
  quantity: number;
  item: Item | undefined;
  calories: number;
  protein: number;
  carbohydrate: number;
  fat: number;
};

export function calculateMealBreakdown(
  mealItems: MealItemInput[],
  itemsById: Map<number, Item>,
): MealItemBreakdown[] {
  return mealItems.map(({ itemId, quantity }) => {
    const item = itemsById.get(itemId);
    if (!item) {
      return {
        itemId,
        quantity,
        item: undefined,
        calories: 0,
        protein: 0,
        carbohydrate: 0,
        fat: 0,
      };
    }
    const { protein, carbohydrate, fat } = item.macronutrients;
    return {
      itemId,
      quantity,
      item,
      calories: scaleByQuantity(item.calories, quantity, item.unit),
      protein: scaleByQuantity(protein, quantity, item.unit),
      carbohydrate: scaleByQuantity(carbohydrate, quantity, item.unit),
      fat: scaleByQuantity(fat, quantity, item.unit),
    };
  });
}

const NO_TOTALS: MacroTotals = { calories: 0, protein: 0, carbohydrate: 0, fat: 0 };

export function sumTotals(totals: MacroTotals[]): MacroTotals {
  return totals.reduce<MacroTotals>(
    (acc, row) => ({
      calories: acc.calories + row.calories,
      protein: acc.protein + row.protein,
      carbohydrate: acc.carbohydrate + row.carbohydrate,
      fat: acc.fat + row.fat,
    }),
    NO_TOTALS,
  );
}

export function isValidQuantity(quantity: number): boolean {
  return Number.isFinite(quantity) && quantity > 0;
}
