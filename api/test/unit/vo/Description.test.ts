import { ValidationError } from "../../../src/domain/error/DomainError";
import Description from "../../../src/domain/vo/Description";

describe("Description", () => {
  test("Should create a valid description", () => {
    const description = new Description("Grilled chicken with rice");
    expect(description.getValue()).toBe("Grilled chicken with rice");
  });

  test("Should create a description with 3 characters", () => {
    const description = new Description("Abc");
    expect(description.getValue()).toBe("Abc");
  });

  test("Should create a description with 500 characters", () => {
    const longDescription = "a".repeat(500);
    const description = new Description(longDescription);
    expect(description.getValue()).toBe(longDescription);
  });

  test("Should throw if description is shorter than 3 characters", () => {
    expect(() => new Description("Ab")).toThrow(ValidationError);
    expect(() => new Description("Ab")).toThrow("Description must be at least 3 characters long.");
  });

  test("Should throw if description exceeds 500 characters", () => {
    const longDescription = "a".repeat(501);
    expect(() => new Description(longDescription)).toThrow(ValidationError);
    expect(() => new Description(longDescription)).toThrow(
      "Description must not exceed 500 characters.",
    );
  });

  test.each([123, true, {}, []])("Should throw if description is not a string (%p)", (value) => {
    expect(() => new Description(value as unknown as string)).toThrow(ValidationError);
    expect(() => new Description(value as unknown as string)).toThrow(
      "Description must be a string.",
    );
  });
});
