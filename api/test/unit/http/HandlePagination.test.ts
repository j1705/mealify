import BadRequestError from "../../../src/infra/http/BadRequestError";
import HandlePagination from "../../../src/infra/http/HandlePagination";

describe("HandlePagination", () => {
  test("Should use page 1 and limit 20 by default", () => {
    expect(new HandlePagination({}).getValue()).toEqual({ page: 1, limit: 20 });
  });

  test("Should parse page and limit", () => {
    expect(new HandlePagination({ page: "3", limit: "100" }).getValue()).toEqual({
      page: 3,
      limit: 100,
    });
  });

  test.each(["0", "-1", "1.5", "abc", "", "1e2"])("Should reject an invalid page (%p)", (page) => {
    expect(() => new HandlePagination({ page })).toThrow(new BadRequestError("Invalid page"));
  });

  test.each(["0", "-1", "1.5", "abc", ""])("Should reject an invalid limit (%p)", (limit) => {
    expect(() => new HandlePagination({ limit })).toThrow(new BadRequestError("Invalid limit"));
  });

  test("Should reject a limit above 100", () => {
    expect(() => new HandlePagination({ limit: "101" })).toThrow(
      new BadRequestError("Limit must be at most 100"),
    );
  });
});
