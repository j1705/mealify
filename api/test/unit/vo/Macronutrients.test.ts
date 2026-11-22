import { ValidationError } from "../../../src/domain/error/DomainError";
import Macronutrients from "../../../src/domain/vo/Macronutrients";

describe("Macronutrients", () => {
  test("Should create valid macronutrients", () => {
    const macronutrients = new Macronutrients({ carbohydrate: 20, protein: 15, fat: 5 });
    expect(macronutrients.getCarbohydrate()).toBe(20);
    expect(macronutrients.getProtein()).toBe(15);
    expect(macronutrients.getFat()).toBe(5);
  });

  test("Should create macronutrients with zero and fractional values", () => {
    const macronutrients = new Macronutrients({ carbohydrate: 0, protein: 0.5, fat: 0 });
    expect(macronutrients.getCarbohydrate()).toBe(0);
    expect(macronutrients.getProtein()).toBe(0.5);
    expect(macronutrients.getFat()).toBe(0);
  });

  test("Should throw if carbohydrate is negative", () => {
    expect(() => new Macronutrients({ carbohydrate: -1, protein: 15, fat: 5 })).toThrow(
      ValidationError,
    );
    expect(() => new Macronutrients({ carbohydrate: -1, protein: 15, fat: 5 })).toThrow(
      "Invalid Carbohydrate",
    );
  });

  test("Should throw if protein is negative", () => {
    expect(() => new Macronutrients({ carbohydrate: 20, protein: -1, fat: 5 })).toThrow(
      ValidationError,
    );
    expect(() => new Macronutrients({ carbohydrate: 20, protein: -1, fat: 5 })).toThrow(
      "Invalid Protein",
    );
  });

  test("Should throw if fat is negative", () => {
    expect(() => new Macronutrients({ carbohydrate: 20, protein: 15, fat: -1 })).toThrow(
      ValidationError,
    );
    expect(() => new Macronutrients({ carbohydrate: 20, protein: 15, fat: -1 })).toThrow(
      "Invalid Fat",
    );
  });

  describe.each([
    ["carbohydrate", "Invalid Carbohydrate"],
    ["protein", "Invalid Protein"],
    ["fat", "Invalid Fat"],
  ])("when %s is not a finite number", (field, message) => {
    test.each([undefined, null, "100", NaN, Infinity])("Should throw (%p)", (value) => {
      const values = { carbohydrate: 20, protein: 15, fat: 5, [field]: value as unknown as number };
      expect(() => new Macronutrients(values)).toThrow(ValidationError);
      expect(() => new Macronutrients(values)).toThrow(message);
    });
  });
});
