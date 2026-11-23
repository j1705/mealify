import { describe, expect, test } from "vitest";
import {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validateDescription,
  validateEmail,
  validateName,
  validateNewPassword,
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

describe("validateEmail", () => {
  test("mirrors the API email limit", () => {
    expect(EMAIL_MAX_LENGTH).toBe(254);
  });

  test.each(["ana@example.com", "  Ana.Silva@Example.COM "])("accepts %p", (email) => {
    expect(validateEmail(email)).toBeUndefined();
  });

  test("asks for the email when it is empty", () => {
    expect(validateEmail("  ")).toBe("Informe o e-mail.");
  });

  test.each(["ana", "ana@", "@example.com", "ana@example", "ana silva@example.com"])(
    "refuses the malformed email %p",
    (email) => {
      expect(validateEmail(email)).toBe("Informe um e-mail válido.");
    },
  );

  test("refuses an email longer than the API accepts", () => {
    const email = `${"a".repeat(64)}@${"b".repeat(EMAIL_MAX_LENGTH - 69)}.com`;
    expect(email).toHaveLength(EMAIL_MAX_LENGTH);
    expect(validateEmail(email)).toBeUndefined();
    expect(validateEmail(`a${email}`)).toBe(
      `O e-mail deve ter no máximo ${EMAIL_MAX_LENGTH} caracteres.`,
    );
  });
});

describe("validateNewPassword", () => {
  test("mirrors the API password limits", () => {
    expect([PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH]).toEqual([8, 72]);
  });

  test("asks for the password when it is empty", () => {
    expect(validateNewPassword("")).toBe("Informe a senha.");
  });

  test("accepts any characters within the length limits, spaces included", () => {
    expect(validateNewPassword("a".repeat(PASSWORD_MIN_LENGTH))).toBeUndefined();
    expect(validateNewPassword(" ".repeat(PASSWORD_MAX_LENGTH))).toBeUndefined();
  });

  test("refuses a password shorter than the minimum", () => {
    expect(validateNewPassword("a".repeat(PASSWORD_MIN_LENGTH - 1))).toBe(
      `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`,
    );
  });

  test("refuses a password longer than the maximum", () => {
    expect(validateNewPassword("a".repeat(PASSWORD_MAX_LENGTH + 1))).toBe(
      `A senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.`,
    );
  });
});
