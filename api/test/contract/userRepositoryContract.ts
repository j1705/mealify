import UserRepository from "../../src/application/repository/UserRepository";
import User from "../../src/domain/entity/User";
import { EmailAlreadyRegisteredError } from "../../src/domain/error/DomainError";

export type UserRepositoryHarness = {
  repository: UserRepository;
  dispose(createdUserIds: number[]): Promise<void>;
};

const UNKNOWN_USER_ID = 2_000_000_000;
const createdAt = new Date("2026-11-22T12:00:00.000Z");

export function describeUserRepositoryContract(
  createHarness: () => Promise<UserRepositoryHarness>,
) {
  describe("UserRepository contract", () => {
    let harness: UserRepositoryHarness;
    let repository: UserRepository;
    const createdUserIds: number[] = [];
    const runTag = `contract${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    let emailSequence = 0;
    const uniqueEmail = () => `${runTag}.${++emailSequence}@example.com`;

    beforeAll(async () => {
      harness = await createHarness();
      repository = harness.repository;
    });

    afterAll(async () => {
      await harness.dispose(createdUserIds);
    });

    async function save(email = uniqueEmail()) {
      const { userId } = await repository.saveUser(
        User.create({ email, passwordHash: "stored-hash" }, createdAt),
      );
      createdUserIds.push(userId);
      return { userId, email };
    }

    test("Should save a user and find it by id", async () => {
      const { userId, email } = await save();

      const user = await repository.getUserById(userId);

      expect(user?.getId()).toBe(userId);
      expect(user?.getEmail()).toBe(email);
      expect(user?.getPasswordHash()).toBe("stored-hash");
      expect(user?.getCreatedAt()).toEqual(createdAt);
    });

    test("Should find a user by email ignoring case", async () => {
      const { userId, email } = await save();

      const user = await repository.getUserByEmail(email.toUpperCase());

      expect(user?.getId()).toBe(userId);
    });

    test("Should return null for an unknown id", async () => {
      expect(await repository.getUserById(UNKNOWN_USER_ID)).toBeNull();
    });

    test("Should return null for an unknown email", async () => {
      expect(await repository.getUserByEmail(uniqueEmail())).toBeNull();
    });

    test("Should refuse a second user with the same email", async () => {
      const { email } = await save();

      await expect(save(email)).rejects.toThrow(EmailAlreadyRegisteredError);
    });
  });
}
