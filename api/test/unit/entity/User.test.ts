import User from "../../../src/domain/entity/User";
import { ValidationError } from "../../../src/domain/error/DomainError";

const createdAt = new Date("2026-11-22T12:00:00.000Z");

describe("User", () => {
  test("Should create a user without an id, normalizing the email", () => {
    const user = User.create({ email: " Ana@Example.com", passwordHash: "hash" }, createdAt);

    expect(user.getId()).toBeUndefined();
    expect(user.getEmail()).toBe("ana@example.com");
    expect(user.getPasswordHash()).toBe("hash");
    expect(user.getCreatedAt()).toEqual(createdAt);
  });

  test("Should restore a persisted user", () => {
    const user = new User({ id: 7, email: "ana@example.com", passwordHash: "hash", createdAt });

    expect(user.getId()).toBe(7);
  });

  test("Should reject an invalid email", () => {
    expect(() => User.create({ email: "ana", passwordHash: "hash" }, createdAt)).toThrow(
      new ValidationError("Invalid email."),
    );
  });
});
