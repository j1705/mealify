import { describe, expect, test } from "vitest";
import { MACRO_SVG_COLORS } from "../../src/utils/colors";
import {
  formatGrams,
  formatNumber,
  isUnit,
  macroSegments,
  nutritionBasis,
  nutritionBasisLabel,
  sumTotals,
  unitBase,
} from "../../src/utils/nutrition";

describe("formatNumber", () => {
  test.each([
    [12, "12"],
    [12.04, "12"],
    [12.25, "12.3"],
    [0.06, "0.1"],
  ])("formats %p as %p", (value, formatted) => {
    expect(formatNumber(value)).toBe(formatted);
  });
});

describe("formatGrams", () => {
  test("appends the gram unit to the formatted number", () => {
    expect(formatGrams(12.25)).toBe("12.3g");
  });
});

describe("sumTotals", () => {
  test("adds calories and macronutrients", () => {
    const totals = sumTotals([
      { calories: 100, protein: 1, carbohydrate: 2, fat: 3 },
      { calories: 50, protein: 0.5, carbohydrate: 1, fat: 0 },
    ]);

    expect(totals).toEqual({ calories: 150, protein: 1.5, carbohydrate: 3, fat: 3 });
  });

  test("starts from zero", () => {
    expect(sumTotals([])).toEqual({ calories: 0, protein: 0, carbohydrate: 0, fat: 0 });
  });
});

describe("macroSegments", () => {
  test("labels and colors each macronutrient share", () => {
    expect(macroSegments({ protein: 30, carbohydrate: 50, fat: 20 })).toEqual([
      { label: "Proteínas", percent: 30, color: MACRO_SVG_COLORS.protein },
      { label: "Carboidratos", percent: 50, color: MACRO_SVG_COLORS.carbohydrate },
      { label: "Gorduras", percent: 20, color: MACRO_SVG_COLORS.fat },
    ]);
  });
});

describe("units", () => {
  test.each(["g", "ml", "unit"])("recognizes %p", (unit) => {
    expect(isUnit(unit)).toBe(true);
  });

  test.each(["kg", "", "G", "toString"])("rejects %p", (unit) => {
    expect(isUnit(unit)).toBe(false);
  });

  test("mirrors the API rule: nutrients per 100 g or ml, or per unit", () => {
    expect([unitBase("g"), unitBase("ml"), unitBase("unit")]).toEqual([100, 100, 1]);
  });

  test.each([
    ["g", "100g", "por 100g"],
    ["ml", "100ml", "por 100ml"],
    ["unit", "unidade", "por unidade"],
  ] as const)("describes the basis of %p", (unit, basis, label) => {
    expect(nutritionBasis(unit)).toBe(basis);
    expect(nutritionBasisLabel(unit)).toBe(label);
  });
});
