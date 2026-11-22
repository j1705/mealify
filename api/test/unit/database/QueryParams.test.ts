import QueryParams from "../../../src/infra/database/QueryParams";

describe("QueryParams", () => {
  test("Should number placeholders in the order values are added", () => {
    const params = new QueryParams();

    expect(params.add("Lunch")).toBe("$1");
    expect(params.add(null)).toBe("$2");
    expect(params.add([1, 2])).toBe("$3");
    expect(params.getValues()).toEqual(["Lunch", null, [1, 2]]);
  });

  test("Should start with no values", () => {
    expect(new QueryParams().getValues()).toEqual([]);
  });

  test("Should not expose its internal list", () => {
    const params = new QueryParams();
    params.add(1);

    params.getValues().push(2);

    expect(params.getValues()).toEqual([1]);
  });
});
