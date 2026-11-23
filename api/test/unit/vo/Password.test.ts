import { ValidationError } from "../../../src/domain/error/DomainError";
import Password from "../../../src/domain/vo/Password";

describe("Password", () => {
  test("Should create a valid password keeping it exactly as typed", () => {
    expect(new Password(" secret pass ").getValue()).toBe(" secret pass ");
  });

  test.each([undefined, null, 12345678, {}])(
    "Should throw if the password is not a string (%p)",
    (value) => {
      expect(() => new Password(value)).toThrow(new ValidationError("Password is required."));
    },
  );

  test("Should accept a password with the minimum length", () => {
    expect(new Password("a".repeat(8)).getValue()).toHaveLength(8);
  });

  test("Should throw if the password is shorter than the minimum length", () => {
    expect(() => new Password("a".repeat(7))).toThrow(
      new ValidationError("Password must be at least 8 characters long."),
    );
  });

  test("Should accept a password with the maximum length", () => {
    expect(new Password("a".repeat(72)).getValue()).toHaveLength(72);
  });

  test("Should throw if the password exceeds the maximum length", () => {
    expect(() => new Password("a".repeat(73))).toThrow(
      new ValidationError("Password must not exceed 72 characters."),
    );
  });

  test("Should not require any kind of character", () => {
    expect(new Password("aaaaaaaa").getValue()).toBe("aaaaaaaa");
  });
});
