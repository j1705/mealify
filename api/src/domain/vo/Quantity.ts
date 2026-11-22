import { ValidationError } from "../error/DomainError";

export default class Quantity {
  private value: number;

  constructor(quantity: unknown) {
    if (!Quantity.isPositiveFiniteNumber(quantity)) throw new ValidationError("Invalid quantity");
    this.value = quantity;
  }

  private static isPositiveFiniteNumber(quantity: unknown): quantity is number {
    return typeof quantity === "number" && Number.isFinite(quantity) && quantity > 0;
  }

  getValue() {
    return this.value;
  }
}
