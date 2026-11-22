import { describe, expect, test } from "vitest";
import {
  isValidQuantityText,
  toMealFormValues,
  toMealInput,
} from "../../src/components/meals/mealFormValues";

const macros = { protein: 1, carbohydrate: 1, fat: 1 };

describe("meal form values", () => {
  test("show saved quantities as text and a missing description as empty", () => {
    const values = toMealFormValues({
      id: 7,
      name: "Dinner",
      description: null,
      date: "2026-11-21",
      createdAt: "2026-11-21T20:00:00.000Z",
      calories: 0,
      macronutrients: macros,
      items: [
        {
          itemId: 3,
          quantity: 150.5,
          name: "Rice",
          unit: "g",
          calories: 0,
          macronutrients: macros,
        },
      ],
    });

    expect(values).toEqual({
      name: "Dinner",
      description: "",
      date: "2026-11-21",
      items: [{ itemId: 3, quantity: "150.5" }],
    });
  });

  test("turn typed quantities into numbers", () => {
    expect(
      toMealInput({
        name: "Dinner",
        description: "",
        date: "2026-11-21",
        items: [
          { itemId: 3, quantity: "150,5" },
          { itemId: 4, quantity: "2" },
        ],
      }).items,
    ).toEqual([
      { itemId: 3, quantity: 150.5 },
      { itemId: 4, quantity: 2 },
    ]);
  });

  test.each(["0.5", "1", "150,25"])("accepts the quantity %p", (text) => {
    expect(isValidQuantityText(text)).toBe(true);
  });

  test.each(["", "0", "0,00", "12,", "1,555"])("refuses the quantity %p", (text) => {
    expect(isValidQuantityText(text)).toBe(false);
  });
});
