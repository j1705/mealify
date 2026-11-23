import { ValidationError } from "../error/DomainError";

export default class Password {
  private value: string;

  static readonly MIN_LENGTH = 8;
  static readonly MAX_LENGTH = 72;

  constructor(password: unknown) {
    if (typeof password !== "string") throw new ValidationError("Password is required.");
    if (password.length < Password.MIN_LENGTH)
      throw new ValidationError(
        `Password must be at least ${Password.MIN_LENGTH} characters long.`,
      );
    if (password.length > Password.MAX_LENGTH)
      throw new ValidationError(`Password must not exceed ${Password.MAX_LENGTH} characters.`);
    this.value = password;
  }

  getValue() {
    return this.value;
  }
}
