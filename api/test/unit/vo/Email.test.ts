import { ValidationError } from "../../../src/domain/error/DomainError";
import Email from "../../../src/domain/vo/Email";

describe("Email", () => {
  test("Should create a valid email", () => {
    expect(new Email("ana@example.com").getValue()).toBe("ana@example.com");
  });

  test("Should normalize the email to lowercase without surrounding spaces", () => {
    expect(new Email("  Ana.Silva@Example.COM ").getValue()).toBe("ana.silva@example.com");
  });

  test.each([undefined, null, 123, {}])(
    "Should throw if the email is not a string (%p)",
    (value) => {
      expect(() => new Email(value)).toThrow(new ValidationError("Email is required."));
    },
  );

  test.each([
    "",
    "   ",
    "ana",
    "ana@",
    "@example.com",
    "ana@example",
    "ana silva@example.com",
    "ana@@example.com",
  ])("Should throw if the email is malformed (%p)", (value) => {
    expect(() => new Email(value)).toThrow(new ValidationError("Invalid email."));
  });

  test("Should accept an email with the maximum length", () => {
    const email = `${"a".repeat(64)}@${"b".repeat(185)}.com`;
    expect(email).toHaveLength(Email.MAX_LENGTH);
    expect(new Email(email).getValue()).toBe(email);
  });

  test("Should throw if the email exceeds the maximum length", () => {
    const email = `${"a".repeat(64)}@${"b".repeat(186)}.com`;
    expect(() => new Email(email)).toThrow(
      new ValidationError(`Email must not exceed ${Email.MAX_LENGTH} characters.`),
    );
  });
});
