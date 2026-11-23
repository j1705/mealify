import Item from "../../../src/domain/entity/Item";
import Meal, { MealProps } from "../../../src/domain/entity/Meal";
import MealItem from "../../../src/domain/entity/MealItem";
import { ValidationError } from "../../../src/domain/error/DomainError";

const OWNER_ID = 7;

describe("Meal", () => {
  const date = new Date("2026-08-18T12:00:00.000Z");
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
  const lunch: MealProps = {
    id: 1,
    userId: OWNER_ID,
    name: "Lunch",
    description: "Grilled chicken with rice",
    items: [MealItem.create(rice, 150)],
    calories: 450,
    carbohydrate: 40,
    protein: 30,
    fat: 10,
    date: "2026-08-18",
    createdAt: date,
  };

  test("Should create a valid meal with description and items", () => {
    const meal = new Meal(lunch);

    expect(meal.getId()).toBe(1);
    expect(meal.getUserId()).toBe(OWNER_ID);
    expect(meal.getName()).toBe("Lunch");
    expect(meal.getDescription()).toBe("Grilled chicken with rice");
    expect(meal.getItems()).toHaveLength(1);
    expect(meal.getItems()[0]?.getItemId()).toBe(1);
    expect(meal.getItems()[0]?.getQuantity()).toBe(150);
    expect(meal.getCalories()).toBe(450);
    expect(meal.getDate()).toBe("2026-08-18");
    expect(meal.getCreatedAt()).toBe(date);
    expect(meal.getMacronutrients()).toEqual({ carbohydrate: 40, protein: 30, fat: 10 });
  });

  test("Should create a meal without description", () => {
    expect(new Meal({ ...lunch, description: null }).getDescription()).toBeNull();
  });

  test.each([undefined, ""])("Should store a description given as %p as null", (description) => {
    const items = [MealItem.create(rice, 100)];
    const meal = Meal.create(
      { userId: OWNER_ID, date: "2026-11-06", name: "Lunch", description, items },
      new Date(),
    );

    expect(meal.getDescription()).toBeNull();
  });

  test("Should throw if name is invalid", () => {
    expect(() => new Meal({ ...lunch, name: "Ab" })).toThrow(ValidationError);
    expect(() => new Meal({ ...lunch, name: "Ab" })).toThrow(
      "Name must be at least 3 characters long.",
    );
  });

  test("Should throw if description is invalid", () => {
    expect(() => new Meal({ ...lunch, description: "Ab" })).toThrow(ValidationError);
    expect(() => new Meal({ ...lunch, description: "Ab" })).toThrow(
      "Description must be at least 3 characters long.",
    );
  });

  test("Should throw if calories is negative", () => {
    expect(() => new Meal({ ...lunch, calories: -1 })).toThrow("Invalid Calories");
  });

  test("Should throw if macronutrients are invalid", () => {
    expect(() => new Meal({ ...lunch, carbohydrate: -1 })).toThrow("Invalid Carbohydrate");
  });

  test("Should create a new meal at the given creation time", () => {
    const createdAt = new Date("2026-11-06T12:00:00.000Z");
    const items = [MealItem.create(rice, 100)];

    const meal = Meal.create(
      { userId: OWNER_ID, date: "2026-11-06", name: "Lunch", items },
      createdAt,
    );

    expect(meal.getCreatedAt()).toBe(createdAt);
  });

  test("Should create a new meal without id, summing nutrients of its items", () => {
    const meal = Meal.create(
      {
        userId: OWNER_ID,
        date: "2026-11-06",
        name: "Lunch",
        description: null,
        items: [MealItem.create(rice, 150), MealItem.create(egg, 2)],
      },
      new Date(),
    );

    expect(meal.getId()).toBeUndefined();
    expect(meal.getUserId()).toBe(OWNER_ID);
    expect(meal.getCalories()).toBeCloseTo(195 + 140);
    expect(meal.getMacronutrients().carbohydrate).toBeCloseTo(42 + 1.2);
    expect(meal.getMacronutrients().protein).toBeCloseTo(4.05 + 12);
    expect(meal.getMacronutrients().fat).toBeCloseTo(0.45 + 10);
  });

  test.each(["2026-02-30", "2026-13-01", "06/11/2026", "2026-1-1", ""])(
    "Should throw if date is invalid (%p)",
    (invalidDate) => {
      expect(() => new Meal({ ...lunch, date: invalidDate })).toThrow(
        new ValidationError("Invalid date"),
      );
    },
  );

  test("Should accept a leap day", () => {
    expect(new Meal({ ...lunch, date: "2028-02-29" }).getDate()).toBe("2028-02-29");
  });

  test("Should throw if meal is created without items", () => {
    expect(() =>
      Meal.create(
        { userId: OWNER_ID, date: "2026-11-06", name: "Lunch", description: null, items: [] },
        new Date(),
      ),
    ).toThrow("Meal must have at least one item");
  });

  test("Should update a persisted meal recalculating totals and keeping id, owner and createdAt", () => {
    const updated = new Meal(lunch).update({
      date: "2026-11-06",
      name: "Big lunch",
      description: null,
      items: [MealItem.create(rice, 150), MealItem.create(egg, 2)],
    });

    expect(updated.getId()).toBe(1);
    expect(updated.getUserId()).toBe(OWNER_ID);
    expect(updated.getDate()).toBe("2026-11-06");
    expect(updated.getCreatedAt()).toBe(date);
    expect(updated.getName()).toBe("Big lunch");
    expect(updated.getDescription()).toBeNull();
    expect(updated.getItems()).toHaveLength(2);
    expect(updated.getCalories()).toBeCloseTo(335);
    expect(updated.getMacronutrients().protein).toBeCloseTo(16.05);
  });

  test("Should throw if meal is updated without items", () => {
    expect(() =>
      new Meal(lunch).update({ date: "2026-11-06", name: "Lunch", description: null, items: [] }),
    ).toThrow("Meal must have at least one item");
  });

  test("Should throw if a meal that was never persisted is updated", () => {
    const meal = Meal.create(
      {
        userId: OWNER_ID,
        date: "2026-11-06",
        name: "Lunch",
        description: null,
        items: [MealItem.create(rice, 1)],
      },
      new Date(),
    );
    expect(() =>
      meal.update({
        date: "2026-11-06",
        name: "Lunch",
        description: null,
        items: [MealItem.create(rice, 2)],
      }),
    ).toThrow("Meal must be persisted before update");
  });
});
