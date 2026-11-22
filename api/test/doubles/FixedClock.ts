import Clock from "../../src/application/clock/Clock";

export default class FixedClock implements Clock {
  constructor(private readonly time: Date) {}

  now(): Date {
    return this.time;
  }
}
