import { describe, expect, test } from "vitest";
import {
  EMPTY_ITEM_FORM_VALUES,
  toItemFormValues,
  toItemInput,
} from "../../src/components/items/itemFormValues";

describe("item form values", () => {
  test("start with every nutrient empty", () => {
    expect(EMPTY_ITEM_FORM_VALUES).toEqual({
      name: "",
      unit: "g",
      calories: "",
      protein: "",
      carbohydrate: "",
      fat: "",
    });
  });

  test("show a saved item's nutrients rounded to 2 decimal places", () => {
    const values = toItemFormValues({
      id: 1,
      name: "Rice",
      unit: "g",
      calories: 130,
      macronutrients: { protein: 2.666, carbohydrate: 28.1, fat: 0 },
    });

    expect(values).toEqual({
      name: "Rice",
      unit: "g",
      calories: "130",
      protein: "2.67",
      carbohydrate: "28.1",
      fat: "0",
    });
  });

  test("turn nutrients typed with comma or dot into numbers", () => {
    expect(
      toItemInput({
        name: "Rice",
        unit: "ml",
        calories: "130",
        protein: "2,5",
        carbohydrate: "28.15",
        fat: "0",
      }),
    ).toEqual({
      name: "Rice",
      unit: "ml",
      calories: 130,
      protein: 2.5,
      carbohydrate: 28.15,
      fat: 0,
    });
  });
});
