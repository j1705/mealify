import { describe, expect, test } from "vitest";
import {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  validateDescription,
  validateName,
} from "../../src/utils/validation";

describe("validateName", () => {
  test("mirrors the API name limits", () => {
    expect([NAME_MIN_LENGTH, NAME_MAX_LENGTH]).toEqual([3, 50]);
  });

  test.each(["", "Ab", "   Ab   "])("asks for at least 3 characters in %p", (name) => {
    expect(validateName(name)).toBe("Informe pelo menos 3 caracteres.");
  });

  test("refuses more than 50 characters", () => {
    expect(validateName("a".repeat(51))).toBe("O nome deve ter no máximo 50 caracteres.");
  });

  test.each(["Rice", "a".repeat(50), `  ${"a".repeat(50)}  `])("accepts %p", (name) => {
    expect(validateName(name)).toBeUndefined();
  });
});

describe("validateDescription", () => {
  test("mirrors the API description limits", () => {
    expect([DESCRIPTION_MIN_LENGTH, DESCRIPTION_MAX_LENGTH]).toEqual([3, 500]);
  });

  test.each(["", "   ", "Rice and beans", "a".repeat(500), `  ${"a".repeat(500)}  `])(
    "accepts %p",
    (text) => {
      expect(validateDescription(text)).toBeUndefined();
    },
  );

  test.each(["Ab", "  Ab  "])("asks for at least 3 characters in %p", (text) => {
    expect(validateDescription(text)).toBe("A descrição deve ter pelo menos 3 caracteres.");
  });

  test("refuses more than 500 characters", () => {
    expect(validateDescription("a".repeat(501))).toBe(
      "A descrição deve ter no máximo 500 caracteres.",
    );
  });
});
