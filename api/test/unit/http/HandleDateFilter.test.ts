import BadRequestError from "../../../src/infra/http/BadRequestError";
import HandleDateFilter from "../../../src/infra/http/HandleDateFilter";

describe("HandleDateFilter", () => {
  test.each([undefined, ""])("Should mean no filter when the date is %p", (date) => {
    expect(new HandleDateFilter(date).getValue()).toBeUndefined();
  });

  test("Should accept a calendar day", () => {
    expect(new HandleDateFilter("2026-11-21").getValue()).toBe("2026-11-21");
  });

  test.each(["2026-02-30", "21/11/2026", "2026-11-21T00:00:00Z", "today"])(
    "Should reject %p",
    (date) => {
      expect(() => new HandleDateFilter(date)).toThrow(new BadRequestError("Invalid date filter"));
    },
  );
});
