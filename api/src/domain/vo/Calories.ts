import { ValidationError } from "../error/DomainError";
import { isNonNegativeNumber } from "./validators";

export default class Calories {
  private value: number;

  constructor(calories: unknown) {
    if (!isNonNegativeNumber(calories)) throw new ValidationError("Invalid Calories");
    this.value = calories;
  }
  getValue() {
    return this.value;
  }
}
