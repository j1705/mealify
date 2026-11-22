import BadRequestError from "../../../src/infra/http/BadRequestError";
import HandleLimit from "../../../src/infra/http/HandleLimit";

describe("HandleLimit", () => {
  const options = { defaultLimit: 5, maxLimit: 20 };

  test("Should use the default limit when none is given", () => {
    expect(new HandleLimit(undefined, options).getValue()).toBe(5);
  });

  test("Should read a positive limit up to the maximum", () => {
    expect(new HandleLimit("20", options).getValue()).toBe(20);
  });

  test.each(["0", "-1", "abc", "1.5"])("Should reject %p", (limit) => {
    expect(() => new HandleLimit(limit, options)).toThrow(new BadRequestError("Invalid limit"));
  });

  test("Should reject a limit above the maximum", () => {
    expect(() => new HandleLimit("21", options)).toThrow(
      new BadRequestError("Limit must be at most 20"),
    );
  });
});
