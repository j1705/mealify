import { ValidationError } from "../error/DomainError";

const UNIT_BASES = { g: 100, ml: 100, unit: 1 } as const;

type UnitValue = keyof typeof UNIT_BASES;

export default class Unit {
  private value: UnitValue;

  constructor(unit: unknown) {
    if (!Unit.isSupported(unit)) throw new ValidationError("Invalid Unit");
    this.value = unit;
  }

  private static isSupported(unit: unknown): unit is UnitValue {
    return typeof unit === "string" && Object.hasOwn(UNIT_BASES, unit);
  }

  getValue() {
    return this.value;
  }

  getBase() {
    return UNIT_BASES[this.value];
  }
}
