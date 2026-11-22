import { ValidationError } from "../../../src/domain/error/DomainError";
import Quantity from "../../../src/domain/vo/Quantity";

describe("Quantity", () => {
  test.each([1, 0.5, 150])("Should accept a positive number: %p", (value) => {
    expect(new Quantity(value).getValue()).toBe(value);
  });

  test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, "1", null, undefined])(
    "Should throw for %p",
    (value) => {
      expect(() => new Quantity(value)).toThrow(new ValidationError("Invalid quantity"));
    },
  );
});
