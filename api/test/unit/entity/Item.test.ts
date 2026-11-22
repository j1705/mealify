import Item, { CreateItemProps, ItemProps } from "../../../src/domain/entity/Item";
import { ValidationError } from "../../../src/domain/error/DomainError";

describe("Item", () => {
  const createdAt = new Date("2026-08-18T12:00:00.000Z");
  const chickenProps: CreateItemProps = {
    name: "Chicken",
    unit: "g",
    calories: 165,
    carbohydrate: 20,
    protein: 31,
    fat: 4,
  };
  const chicken: ItemProps = { ...chickenProps, id: 1, createdAt };

  test("Should create a valid item", () => {
    const item = new Item(chicken);

    expect(item.getId()).toBe(1);
    expect(item.getName()).toBe("Chicken");
    expect(item.getCalories()).toBe(165);
    expect(item.getCreatedAt()).toBe(createdAt);
    expect(item.getUnit()).toBe("g");
    expect(item.getUnitBase()).toBe(100);
    expect(item.getMacronutrients()).toEqual({ carbohydrate: 20, protein: 31, fat: 4 });
  });

  test("Should create a new item without id at the given creation time", () => {
    const item = Item.create(chickenProps, createdAt);

    expect(item.getId()).toBeUndefined();
    expect(item.getName()).toBe("Chicken");
    expect(item.getCreatedAt()).toBe(createdAt);
  });

  test("Should update a persisted item keeping id and createdAt", () => {
    const updated = new Item(chicken).update({
      name: "Grilled chicken",
      unit: "g",
      calories: 190,
      carbohydrate: 0,
      protein: 29,
      fat: 7.7,
    });

    expect(updated.getId()).toBe(1);
    expect(updated.getCreatedAt()).toBe(createdAt);
    expect(updated.getName()).toBe("Grilled chicken");
    expect(updated.getCalories()).toBe(190);
    expect(updated.getMacronutrients()).toEqual({ carbohydrate: 0, protein: 29, fat: 7.7 });
  });

  test("Should validate the new values on update", () => {
    expect(() => new Item(chicken).update({ ...chickenProps, calories: -1 })).toThrow(
      "Invalid Calories",
    );
  });

  test("Should throw if an item that was never persisted is updated", () => {
    const item = Item.create(chickenProps, new Date());

    expect(() => item.update(chickenProps)).toThrow(ValidationError);
    expect(() => item.update(chickenProps)).toThrow("Item must be persisted before update");
  });

  test("Should use base 1 for items measured in units", () => {
    expect(new Item({ ...chicken, unit: "unit" }).getUnitBase()).toBe(1);
  });

  test("Should throw if name is invalid", () => {
    expect(() => new Item({ ...chicken, name: "Ab" })).toThrow(ValidationError);
    expect(() => new Item({ ...chicken, name: "Ab" })).toThrow(
      "Name must be at least 3 characters long.",
    );
  });

  test("Should throw if unit is invalid", () => {
    expect(() => new Item({ ...chicken, unit: "kg" })).toThrow(ValidationError);
    expect(() => new Item({ ...chicken, unit: "kg" })).toThrow("Invalid Unit");
  });

  test("Should throw if calories is negative", () => {
    expect(() => new Item({ ...chicken, calories: -1 })).toThrow(ValidationError);
    expect(() => new Item({ ...chicken, calories: -1 })).toThrow("Invalid Calories");
  });

  test("Should throw if macronutrients are invalid", () => {
    expect(() => new Item({ ...chicken, carbohydrate: -1 })).toThrow("Invalid Carbohydrate");
    expect(() => new Item({ ...chicken, protein: -1 })).toThrow("Invalid Protein");
    expect(() => new Item({ ...chicken, fat: -1 })).toThrow("Invalid Fat");
  });
});
