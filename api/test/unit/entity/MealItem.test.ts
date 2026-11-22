import { ValidationError } from "../../../src/domain/error/DomainError";
import Item from "../../../src/domain/entity/Item";
import MealItem from "../../../src/domain/entity/MealItem";

describe("MealItem", () => {
  const rice = { name: "Rice", unit: "g", calories: 130, carbohydrate: 28, protein: 2.7, fat: 0.3 };

  test("Should create a meal item with nutrients calculated for the quantity", () => {
    const mealItem = MealItem.create(new Item({ ...rice, id: 1, createdAt: new Date() }), 150);

    expect(mealItem.getItemId()).toBe(1);
    expect(mealItem.getName()).toBe("Rice");
    expect(mealItem.getUnit()).toBe("g");
    expect(mealItem.getQuantity()).toBe(150);
    expect(mealItem.getCalories()).toBeCloseTo(195);
    expect(mealItem.getMacronutrients().carbohydrate).toBeCloseTo(42);
  });

  test("Should throw if item was not persisted", () => {
    expect(() => MealItem.create(Item.create(rice, new Date()), 150)).toThrow(
      "Item must be persisted before use",
    );
  });

  test.each([0, -10, undefined, null, "100", NaN, Infinity])(
    "Should throw if quantity is not a number greater than zero (%p)",
    (quantity) => {
      const item = new Item({ ...rice, id: 1, createdAt: new Date() });
      expect(() => MealItem.create(item, quantity as unknown as number)).toThrow(ValidationError);
      expect(() => MealItem.create(item, quantity as unknown as number)).toThrow(
        "Invalid quantity",
      );
    },
  );

  test("Should accept a fractional quantity", () => {
    const item = new Item({ ...rice, id: 1, createdAt: new Date() });
    expect(MealItem.create(item, 0.5).getQuantity()).toBe(0.5);
  });
});
