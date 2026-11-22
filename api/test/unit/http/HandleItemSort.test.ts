import BadRequestError from "../../../src/infra/http/BadRequestError";
import HandleItemSort from "../../../src/infra/http/HandleItemSort";

describe("HandleItemSort", () => {
  test("Should sort newest first by default", () => {
    expect(new HandleItemSort({}).getValue()).toEqual({ field: "createdAt", order: "desc" });
  });

  test.each([
    ["name", "asc"],
    ["calories", "asc"],
    ["createdAt", "desc"],
  ])("Should use the default order of %p when order is missing", (sort, order) => {
    expect(new HandleItemSort({ sort }).getValue()).toEqual({ field: sort, order });
  });

  test("Should parse sort and order", () => {
    expect(new HandleItemSort({ sort: "calories", order: "desc" }).getValue()).toEqual({
      field: "calories",
      order: "desc",
    });
  });

  test.each(["price", "NAME", "", "id"])("Should reject an invalid sort (%p)", (sort) => {
    expect(() => new HandleItemSort({ sort })).toThrow(new BadRequestError("Invalid sort"));
  });

  test.each(["up", "ASC", ""])("Should reject an invalid order (%p)", (order) => {
    expect(() => new HandleItemSort({ sort: "name", order })).toThrow(
      new BadRequestError("Invalid order"),
    );
  });

  test.each(["up", "ASC", ""])("Should reject an invalid order even without sort (%p)", (order) => {
    expect(() => new HandleItemSort({ order })).toThrow(new BadRequestError("Invalid order"));
  });

  test("Should apply the order to the default field when sort is missing", () => {
    expect(new HandleItemSort({ order: "asc" }).getValue()).toEqual({
      field: "createdAt",
      order: "asc",
    });
  });
});
