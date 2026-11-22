import { ValidationError } from "../error/DomainError";

export default class Description {
  private value: string;

  constructor(description: unknown) {
    if (typeof description !== "string") throw new ValidationError("Description must be a string.");
    if (description.length > 500)
      throw new ValidationError("Description must not exceed 500 characters.");
    if (description.length < 3)
      throw new ValidationError("Description must be at least 3 characters long.");
    this.value = description;
  }
  getValue() {
    return this.value;
  }
}
