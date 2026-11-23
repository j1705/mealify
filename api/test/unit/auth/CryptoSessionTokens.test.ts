import CryptoSessionTokens from "../../../src/infra/auth/CryptoSessionTokens";

describe("CryptoSessionTokens", () => {
  const tokens = new CryptoSessionTokens();

  test("Should generate a 256-bit URL-safe token", () => {
    const token = tokens.generate();

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  test("Should generate a different token each time", () => {
    const generated = new Set(Array.from({ length: 100 }, () => tokens.generate()));

    expect(generated.size).toBe(100);
  });

  test("Should digest a token into a stable SHA-256 hex string", () => {
    expect(tokens.digest("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});
