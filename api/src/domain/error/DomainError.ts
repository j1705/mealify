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

export class ValidationError extends DomainError {}
