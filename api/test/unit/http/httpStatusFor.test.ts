import {
  AuthenticationRequiredError,
  ConflictError,
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  ItemNotFoundError,
  MealNotFoundError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../../src/domain/error/DomainError";
import BadRequestError from "../../../src/infra/http/BadRequestError";
import { httpStatusFor } from "../../../src/infra/http/httpStatusFor";

describe("httpStatusFor", () => {
  test.each([
    [new BadRequestError("Id invalid"), 400],
    [new UnauthorizedError("Not allowed"), 401],
    [new InvalidCredentialsError(), 401],
    [new AuthenticationRequiredError(), 401],
    [new NotFoundError("Item not found"), 404],
    [new ItemNotFoundError(), 404],
    [new MealNotFoundError(), 404],
    [new ConflictError("Item already registered"), 409],
    [new EmailAlreadyRegisteredError(), 409],
    [new ValidationError("Invalid Unit"), 422],
  ])("Should answer the status for %p", (error, status) => {
    expect(httpStatusFor(error)).toBe(status);
  });

  test.each([new Error("database is down"), "a thrown string", null, undefined])(
    "Should answer 500 for an unexpected error: %p",
    (error) => {
      expect(httpStatusFor(error)).toBe(500);
    },
  );
});
