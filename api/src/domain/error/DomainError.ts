export default abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends DomainError {}

export class ItemNotFoundError extends NotFoundError {
  constructor() {
    super("Item not found");
  }
}

export class MealNotFoundError extends NotFoundError {
  constructor() {
    super("Meal not found");
  }
}

export class ConflictError extends DomainError {}

export class ItemAlreadyRegisteredError extends ConflictError {
  constructor() {
    super("Item already registered");
  }
}

export class EmailAlreadyRegisteredError extends ConflictError {
  constructor() {
    super("Email already registered");
  }
}

export class ValidationError extends DomainError {}

export class UnauthorizedError extends DomainError {}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super("Invalid email or password");
  }
}

export class AuthenticationRequiredError extends UnauthorizedError {
  constructor() {
    super("Authentication required");
  }
}
