import SessionRepository from "../../../application/repository/SessionRepository";
import Session from "../../../domain/entity/Session";
import DatabaseConnection from "../../database/DatabaseConnection";

type SessionRow = {
  token_hash: string;
  user_id: number;
  expires_at: Date;
};

export default class SessionRepositoryDatabase implements SessionRepository {
  constructor(readonly connection: DatabaseConnection) {}

  async saveSession(session: Session): Promise<void> {
    await this.connection.query(
      `insert into sessions (token_hash, user_id, expires_at) values ($1, $2, $3)`,
      [session.getTokenHash(), session.getUserId(), session.getExpiresAt()],
    );
  }

  async getSessionByTokenHash(tokenHash: string): Promise<Session | null> {
    const [row] = await this.connection.query<SessionRow>(
      `select token_hash, user_id, expires_at from sessions where token_hash = $1`,
      [tokenHash],
    );
    return row
      ? new Session({ userId: row.user_id, tokenHash: row.token_hash, expiresAt: row.expires_at })
      : null;
  }

  async deleteSessionByTokenHash(tokenHash: string): Promise<void> {
    await this.connection.query(`delete from sessions where token_hash = $1`, [tokenHash]);
  }
}
