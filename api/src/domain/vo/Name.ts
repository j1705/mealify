import { ValidationError } from "../error/DomainError";

export default class Name {
  private value: string;

  static readonly MIN_LENGTH = 3;
  static readonly MAX_LENGTH = 50;

  constructor(name: unknown) {
    if (typeof name !== "string") throw new ValidationError("Name is required.");
    if (name.length > Name.MAX_LENGTH)
      throw new ValidationError(`Name must not exceed ${Name.MAX_LENGTH} characters.`);
    if (name.length < Name.MIN_LENGTH)
      throw new ValidationError(`Name must be at least ${Name.MIN_LENGTH} characters long.`);
    this.value = name;
  }
  getValue() {
    return this.value;
  }
}
