import { ValidationError } from "../error/DomainError";

const ISO_CALENDAR_DAY = /^\d{4}-\d{2}-\d{2}$/;

export default class MealDate {
  private value: string;

  constructor(date: unknown) {
    if (!MealDate.isValid(date)) throw new ValidationError("Invalid date");
    this.value = date;
  }

  static isValid(date: unknown): date is string {
    if (typeof date !== "string" || !ISO_CALENDAR_DAY.test(date)) return false;
    const [year, month, day] = date.split("-").map(Number) as [number, number, number];
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return (
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day
    );
  }

  getValue() {
    return this.value;
  }
}
