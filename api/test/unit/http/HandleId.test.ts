import BadRequestError from "../../../src/infra/http/BadRequestError";
import HandleId from "../../../src/infra/http/HandleId";

describe("HandleId", () => {
  test("Should create a valid id", () => {
    const id = new HandleId("1");
    expect(id.getValue()).toBe(1);
  });
  test("Should accept the largest id the database can store", () => {
    expect(new HandleId("2147483647").getValue()).toBe(2147483647);
  });

  test.each(["0", "-1", "1.5", "abc", "", " ", "NaN", "Infinity", "2147483648", "3000000000"])(
    "Should throw if id is invalid (%s)",
    (invalidId) => {
      expect(() => new HandleId(invalidId)).toThrow(BadRequestError);
      expect(() => new HandleId(invalidId)).toThrow("Id invalid");
    },
  );
});
