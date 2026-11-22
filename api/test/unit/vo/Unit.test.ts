import { ValidationError } from "../../../src/domain/error/DomainError";
import Unit from "../../../src/domain/vo/Unit";

describe("Unit", () => {
  test("Should create a valid unit in grams", () => {
    const unit = new Unit("g");
    expect(unit.getValue()).toBe("g");
    expect(unit.getBase()).toBe(100);
  });

  test("Should create a valid unit in milliliters", () => {
    const unit = new Unit("ml");
    expect(unit.getValue()).toBe("ml");
    expect(unit.getBase()).toBe(100);
  });

  test("Should create a valid unit as unit with base 1", () => {
    const unit = new Unit("unit");
    expect(unit.getValue()).toBe("unit");
    expect(unit.getBase()).toBe(1);
  });

  test("Should throw if unit is invalid", () => {
    expect(() => new Unit("kg")).toThrow(ValidationError);
    expect(() => new Unit("kg")).toThrow("Invalid Unit");
  });

  test.each([[["g"]], [[["ml"]]], [100], [null], [undefined]])(
    "Should throw for a value that is not a string: %p",
    (unit) => {
      expect(() => new Unit(unit)).toThrow(new ValidationError("Invalid Unit"));
    },
  );

  test.each(["toString", "constructor", "__proto__"])(
    "Should throw for inherited object keys like %p",
    (unit) => {
      expect(() => new Unit(unit)).toThrow(new ValidationError("Invalid Unit"));
    },
  );
});
