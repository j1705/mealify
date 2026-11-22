import { toItemOutput } from "../../../src/application/mapper/ItemOutputMapper";
import Item from "../../../src/domain/entity/Item";

describe("toItemOutput", () => {
  test("Should group the macronutrients, like the meal outputs", () => {
    const item = new Item({
      id: 7,
      name: "Egg",
      unit: "unit",
      calories: 70,
      carbohydrate: 0.6,
      protein: 6,
      fat: 5,
      createdAt: new Date("2026-11-01T00:00:00Z"),
    });

    expect(toItemOutput(item)).toEqual({
      id: 7,
      name: "Egg",
      unit: "unit",
      calories: 70,
      macronutrients: { carbohydrate: 0.6, protein: 6, fat: 5 },
    });
  });
});
