import { ValidationError } from "../../../src/domain/error/DomainError";
import Name from "../../../src/domain/vo/Name";

describe("Name", () => {
  test("Should create a valid name", () => {
    const name = new Name("Chicken");
    expect(name.getValue()).toBe("Chicken");
  });

  test("Should throw if name is shorter than 3 caracters", () => {
    expect(() => new Name("Ab")).toThrow(ValidationError);
    expect(() => new Name("Ab")).toThrow("Name must be at least 3 characters long.");
  });

  test("Should throw if name exceeds 50 characters", () => {
    const longName = "a".repeat(51);
    expect(() => new Name(longName)).toThrow(ValidationError);
    expect(() => new Name(longName)).toThrow("Name must not exceed 50 characters.");
  });

  test.each([undefined, null, 123, {}])("Should throw if name is not a string (%p)", (value) => {
    expect(() => new Name(value as unknown as string)).toThrow(ValidationError);
    expect(() => new Name(value as unknown as string)).toThrow("Name is required.");
  });
});
