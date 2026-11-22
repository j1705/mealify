import Clock from "../../application/clock/Clock";

export default class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
