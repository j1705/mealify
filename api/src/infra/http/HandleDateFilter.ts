import MealDate from "../../domain/vo/MealDate";
import BadRequestError from "./BadRequestError";

export default class HandleDateFilter {
  private value: string | undefined;

  constructor(date: string | undefined) {
    if (!date) {
      this.value = undefined;
      return;
    }
    if (!MealDate.isValid(date)) throw new BadRequestError("Invalid date filter");
    this.value = date;
  }

  getValue() {
    return this.value;
  }
}
