import Session from "../../domain/entity/Session";

export default interface SessionRepository {
  saveSession(session: Session): Promise<void>;
  getSessionByTokenHash(tokenHash: string): Promise<Session | null>;
  deleteSessionByTokenHash(tokenHash: string): Promise<void>;
}
