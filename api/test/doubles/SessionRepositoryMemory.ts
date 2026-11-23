import SessionRepository from "../../src/application/repository/SessionRepository";
import Session from "../../src/domain/entity/Session";

export default class SessionRepositoryMemory implements SessionRepository {
  private sessionsByTokenHash = new Map<string, Session>();

  async saveSession(session: Session): Promise<void> {
    this.sessionsByTokenHash.set(session.getTokenHash(), session);
  }

  async getSessionByTokenHash(tokenHash: string): Promise<Session | null> {
    return this.sessionsByTokenHash.get(tokenHash) ?? null;
  }

  async deleteSessionByTokenHash(tokenHash: string): Promise<void> {
    this.sessionsByTokenHash.delete(tokenHash);
  }
}
