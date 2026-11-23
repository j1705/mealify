import { ValidationError } from "../error/DomainError";

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default class Email {
  private value: string;

  static readonly MAX_LENGTH = 254;

  constructor(email: unknown) {
    if (typeof email !== "string") throw new ValidationError("Email is required.");
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_FORMAT.test(normalized)) throw new ValidationError("Invalid email.");
    if (normalized.length > Email.MAX_LENGTH)
      throw new ValidationError(`Email must not exceed ${Email.MAX_LENGTH} characters.`);
    this.value = normalized;
  }

  getValue() {
    return this.value;
  }
}
