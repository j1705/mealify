import { ValidationError } from "../../../src/domain/error/DomainError";
import Calories from "../../../src/domain/vo/Calories";

describe("Calories", () => {
  test("Should create valid calories", () => {
    const calories = new Calories(165);
    expect(calories.getValue()).toBe(165);
  });

  test("Should create calories with zero", () => {
    const calories = new Calories(0);
    expect(calories.getValue()).toBe(0);
  });

  test("Should throw if calories is negative", () => {
    expect(() => new Calories(-1)).toThrow(ValidationError);
    expect(() => new Calories(-1)).toThrow("Invalid Calories");
  });

  test.each([undefined, null, "100", NaN, Infinity])(
    "Should throw if calories is not a finite number (%p)",
    (value) => {
      expect(() => new Calories(value as unknown as number)).toThrow(ValidationError);
      expect(() => new Calories(value as unknown as number)).toThrow("Invalid Calories");
    },
  );
});
