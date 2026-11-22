import SystemClock from "../../../src/infra/clock/SystemClock";

describe("SystemClock", () => {
  test("Should tell the current time", () => {
    const before = Date.now();
    const now = new SystemClock().now().getTime();

    expect(now).toBeGreaterThanOrEqual(before);
    expect(now).toBeLessThanOrEqual(Date.now());
  });
});
