import ScryptPasswordHasher from "../../../src/infra/auth/ScryptPasswordHasher";

describe("ScryptPasswordHasher", () => {
  const hasher = new ScryptPasswordHasher();
  const password = "correct horse battery";

  test("Should not keep the password in the hash", async () => {
    const hash = await hasher.hash(password);

    expect(hash).not.toContain(password);
  });

  test("Should verify the right password", async () => {
    const hash = await hasher.hash(password);

    expect(await hasher.verify(password, hash)).toBe(true);
  });

  test("Should reject a wrong password", async () => {
    const hash = await hasher.hash(password);

    expect(await hasher.verify("correct horse battery!", hash)).toBe(false);
  });

  test("Should salt each hash, so the same password gives different hashes", async () => {
    const [first, second] = await Promise.all([hasher.hash(password), hasher.hash(password)]);

    expect(first).not.toBe(second);
    expect(await hasher.verify(password, second)).toBe(true);
  });

  test.each([
    "",
    "not-a-hash",
    "scrypt$only-salt",
    "bcrypt$c2FsdA$aGFzaA",
    "scrypt$c2FsdA$@@@@",
    "scrypt$c2FsdA$aGFzaA",
  ])("Should reject a malformed stored hash instead of throwing: %p", async (storedHash) => {
    expect(await hasher.verify(password, storedHash)).toBe(false);
  });
});
