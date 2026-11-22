import Item from "../../../src/domain/entity/Item";
import calculateNutrients from "../../../src/domain/service/calculateNutrients";

describe("calculateNutrients", () => {
  const date = new Date("2026-08-18T12:00:00.000Z");

  test("Should calculate nutrients proportionally for items measured in grams (base 100)", () => {
    const rice = new Item({
      id: 1,
      name: "Rice",
      unit: "g",
      calories: 130,
      carbohydrate: 28,
      protein: 2.7,
      fat: 0.3,
      createdAt: date,
    });

    const result = calculateNutrients(rice, 150);

    expect(result.calories).toBeCloseTo(195);
    expect(result.carbohydrate).toBeCloseTo(42);
    expect(result.protein).toBeCloseTo(4.05);
    expect(result.fat).toBeCloseTo(0.45);
  });

  test("Should calculate nutrients for items measured in units (base 1)", () => {
    const egg = new Item({
      id: 2,
      name: "Egg",
      unit: "unit",
      calories: 70,
      carbohydrate: 0.6,
      protein: 6,
      fat: 5,
      createdAt: date,
    });

    const result = calculateNutrients(egg, 3);

    expect(result.calories).toBeCloseTo(210);
    expect(result.carbohydrate).toBeCloseTo(1.8);
    expect(result.protein).toBeCloseTo(18);
    expect(result.fat).toBeCloseTo(15);
  });
});
