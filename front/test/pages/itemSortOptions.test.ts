import { describe, expect, test } from "vitest";
import {
  ITEM_SORT_OPTIONS,
  apiSortFor,
  isItemSortOption,
} from "../../src/pages/items/itemSortOptions";

describe("item sort options", () => {
  test("offers name and calories in both directions", () => {
    expect(ITEM_SORT_OPTIONS.map(({ value }) => value)).toEqual([
      "name-asc",
      "name-desc",
      "calories-desc",
      "calories-asc",
    ]);
  });

  test.each(["name-asc", "calories-desc"])("recognizes %p", (value) => {
    expect(isItemSortOption(value)).toBe(true);
  });

  test.each(["", "createdAt-desc", "toString", "NAME-ASC"])("rejects %p", (value) => {
    expect(isItemSortOption(value)).toBe(false);
  });

  test("maps an option to the API sort", () => {
    expect(apiSortFor("calories-desc")).toEqual({ field: "calories", order: "desc" });
  });
});
