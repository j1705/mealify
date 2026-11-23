import { describe, expect, test } from "vitest";
import { safeRedirectPath } from "../../src/utils/redirect";

describe("safeRedirectPath", () => {
  test.each(["/meals", "/meals/7/edit", "/items?search=arroz&page=2", "/"])(
    "keeps the app path %p",
    (path) => {
      expect(safeRedirectPath(path)).toBe(path);
    },
  );

  test.each([
    null,
    "",
    "meals",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
    "/login",
    "/register?next=/meals",
  ])("falls back to the home page for %p", (path) => {
    expect(safeRedirectPath(path)).toBe("/");
  });
});
