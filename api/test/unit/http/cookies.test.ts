import { parseCookies } from "../../../src/infra/http/cookies";

describe("parseCookies", () => {
  test.each([undefined, ""])("Should answer no cookies for header %p", (header) => {
    expect(parseCookies(header)).toEqual({});
  });

  test("Should read every cookie of the header", () => {
    expect(parseCookies("a=1; b=two;c=3")).toEqual({ a: "1", b: "two", c: "3" });
  });

  test("Should decode encoded values and keep '=' inside values", () => {
    expect(parseCookies("name=oat%20meal; token=abc=def")).toEqual({
      name: "oat meal",
      token: "abc=def",
    });
  });

  test("Should keep the raw value when it is not valid percent-encoding", () => {
    expect(parseCookies("broken=%E0%A4%A")).toEqual({ broken: "%E0%A4%A" });
  });

  test("Should ignore pieces without a name", () => {
    expect(parseCookies("=orphan; valid=1; noequals")).toEqual({ valid: "1" });
  });

  test("Should keep the first value of a repeated cookie", () => {
    expect(parseCookies("a=first; a=second")).toEqual({ a: "first" });
  });

  test("Should keep cookies named like object properties as plain values", () => {
    const cookies = parseCookies("__proto__=x; toString=y");

    expect(Object.entries(cookies)).toEqual([
      ["__proto__", "x"],
      ["toString", "y"],
    ]);
    expect(Object.getPrototypeOf(cookies)).toBe(Object.prototype);
  });
});
