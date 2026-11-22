import BadRequestError from "../../../src/infra/http/BadRequestError";
import HandleSearch from "../../../src/infra/http/HandleSearch";

describe("HandleSearch", () => {
  test.each([undefined, "", "   "])("Should mean no filter when the term is %p", (search) => {
    expect(new HandleSearch(search).getValue()).toBeUndefined();
  });

  test("Should trim the term", () => {
    expect(new HandleSearch("  arroz ").getValue()).toBe("arroz");
  });

  test("Should accept a term of 50 characters, counted after trimming", () => {
    const term = "a".repeat(50);
    expect(new HandleSearch(` ${term} `).getValue()).toBe(term);
  });

  test("Should reject a term longer than 50 characters", () => {
    expect(() => new HandleSearch("a".repeat(51))).toThrow(
      new BadRequestError("Search must be at most 50 characters"),
    );
  });
});
