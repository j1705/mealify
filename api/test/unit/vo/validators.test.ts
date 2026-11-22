import { isNonNegativeNumber } from "../../../src/domain/vo/validators";

describe("isNonNegativeNumber", () => {
  test.each([0, 1, 0.5, 1e6])("Should accept %p", (value) => {
    expect(isNonNegativeNumber(value)).toBe(true);
  });

  test.each([-1, -0.1, NaN, Infinity, -Infinity, "1", null, undefined, [1]])(
    "Should reject %p",
    (value) => {
      expect(isNonNegativeNumber(value)).toBe(false);
    },
  );
});
