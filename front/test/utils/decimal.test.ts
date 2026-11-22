import { describe, expect, test } from "vitest";
import {
  DECIMAL_MAX_FRACTION_DIGITS,
  DECIMAL_MAX_INTEGER_DIGITS,
  formatDecimal,
  isDecimal,
  isDecimalDraft,
  parseDecimal,
} from "../../src/utils/decimal";

describe("decimal limits", () => {
  test("allow up to 5 integer digits and 2 decimal places", () => {
    expect([DECIMAL_MAX_INTEGER_DIGITS, DECIMAL_MAX_FRACTION_DIGITS]).toEqual([5, 2]);
  });
});

describe("isDecimalDraft", () => {
  test.each(["", "0", "12", "12,", "12.", "12,5", "12.55", "99999,99"])(
    "accepts the partially typed %p",
    (text) => {
      expect(isDecimalDraft(text)).toBe(true);
    },
  );

  test.each(["-1", "+1", "1e5", "1,555", "123456", "1,2,3", "1.2,3", ",5", " 1", "abc"])(
    "rejects %p",
    (text) => {
      expect(isDecimalDraft(text)).toBe(false);
    },
  );
});

describe("isDecimal", () => {
  test.each(["0", "12", "12,5", "12.55", "99999,99"])("accepts the complete %p", (text) => {
    expect(isDecimal(text)).toBe(true);
  });

  test.each(["", "12,", "12.", ",5", "1,555", "123456", "-1"])("rejects %p", (text) => {
    expect(isDecimal(text)).toBe(false);
  });
});

describe("parseDecimal", () => {
  test.each([
    ["12,5", 12.5],
    ["3.25", 3.25],
    ["0", 0],
    ["99999,99", 99999.99],
  ])("reads %p as %p", (text, expected) => {
    expect(parseDecimal(text)).toBe(expected);
  });

  test.each(["", "12,", "abc", "1e5"])("returns null for %p", (text) => {
    expect(parseDecimal(text)).toBeNull();
  });
});

describe("formatDecimal", () => {
  test.each([
    [165, "165"],
    [3.6, "3.6"],
    [0.125, "0.13"],
    [3.333, "3.33"],
  ])("writes %p as %p", (value, expected) => {
    expect(formatDecimal(value)).toBe(expected);
  });
});
