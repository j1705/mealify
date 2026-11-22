import DomainError, {
  ConflictError,
  ItemAlreadyRegisteredError,
  ItemNotFoundError,
  MealNotFoundError,
  NotFoundError,
  ValidationError,
} from "../../../src/domain/error/DomainError";

describe("DomainError", () => {
  test("Should only be thrown through a specific subclass", () => {
    // @ts-expect-error DomainError is abstract
    const instantiate = () => new DomainError("Generic failure");

    expect(instantiate).toBeDefined();
  });

  test.each([
    [NotFoundError, "Item not found"],
    [ConflictError, "Item already exists"],
    [ValidationError, "Invalid Unit"],
  ])("Should create %p carrying only its message", (ErrorClass, message) => {
    const error = new ErrorClass(message);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(ErrorClass);
    expect(error.name).toBe(ErrorClass.name);
    expect(error.message).toBe(message);
    expect(error).not.toHaveProperty("statusCode");
  });

  test.each([
    [ItemNotFoundError, "Item not found"],
    [MealNotFoundError, "Meal not found"],
  ])("Should create %p as a NotFoundError with a fixed message", (ErrorClass, message) => {
    const error = new ErrorClass();

    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.name).toBe(ErrorClass.name);
    expect(error.message).toBe(message);
  });

  test("Should create ItemAlreadyRegisteredError as a ConflictError with a fixed message", () => {
    const error = new ItemAlreadyRegisteredError();

    expect(error).toBeInstanceOf(ConflictError);
    expect(error.name).toBe("ItemAlreadyRegisteredError");
    expect(error.message).toBe("Item already registered");
  });
});
