import SessionRepository from "../../src/application/repository/SessionRepository";
import Session from "../../src/domain/entity/Session";

export type SessionRepositoryHarness = {
  repository: SessionRepository;
  createUser(): Promise<number>;
  dispose(): Promise<void>;
};

const openedAt = new Date("2026-11-22T12:00:00.000Z");

export function describeSessionRepositoryContract(
  createHarness: () => Promise<SessionRepositoryHarness>,
) {
  describe("SessionRepository contract", () => {
    let harness: SessionRepositoryHarness;
    let repository: SessionRepository;
    let userId: number;
    const runTag = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    let tokenSequence = 0;
    const uniqueTokenHash = () => `${runTag}-${++tokenSequence}`.padEnd(64, "0");

    beforeAll(async () => {
      harness = await createHarness();
      repository = harness.repository;
      userId = await harness.createUser();
    });

    afterAll(async () => {
      await harness.dispose();
    });

    async function save() {
      const session = Session.open({ userId, tokenHash: uniqueTokenHash() }, openedAt);
      await repository.saveSession(session);
      return session;
    }

    test("Should save a session and find it by its token hash", async () => {
      const saved = await save();

      const session = await repository.getSessionByTokenHash(saved.getTokenHash());

      expect(session?.getUserId()).toBe(userId);
      expect(session?.getTokenHash()).toBe(saved.getTokenHash());
      expect(session?.getExpiresAt()).toEqual(saved.getExpiresAt());
    });

    test("Should return null for an unknown token hash", async () => {
      expect(await repository.getSessionByTokenHash(uniqueTokenHash())).toBeNull();
    });

    test("Should delete a session by its token hash, keeping the others", async () => {
      const deleted = await save();
      const kept = await save();

      await repository.deleteSessionByTokenHash(deleted.getTokenHash());

      expect(await repository.getSessionByTokenHash(deleted.getTokenHash())).toBeNull();
      expect(await repository.getSessionByTokenHash(kept.getTokenHash())).not.toBeNull();
    });

    test("Should ignore the deletion of an unknown token hash", async () => {
      await expect(repository.deleteSessionByTokenHash(uniqueTokenHash())).resolves.toBeUndefined();
    });
  });
}
