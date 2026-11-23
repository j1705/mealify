import { randomBytes } from "node:crypto";
import Session from "../../src/domain/entity/Session";
import { readDatabaseConfig } from "../../src/infra/database/DatabaseConfig";
import { PgPromiseAdapter } from "../../src/infra/database/DatabaseConnection";
import SessionRepositoryDatabase from "../../src/infra/repositoryDatabase/session/SessionRepositoryDatabase";
import { describeSessionRepositoryContract } from "../contract/sessionRepositoryContract";

async function insertUser(connection: PgPromiseAdapter): Promise<number> {
  const email = `session${Date.now()}${Math.random().toString(36).slice(2, 6)}@example.com`;
  const [user] = await connection.query<{ id: number }>(
    `insert into users (email, password_hash) values ($1, 'hash') returning id`,
    [email],
  );
  return user!.id;
}

describe("SessionRepositoryDatabase", () => {
  describeSessionRepositoryContract(async () => {
    const connection = new PgPromiseAdapter(readDatabaseConfig());
    const userIds: number[] = [];
    return {
      repository: new SessionRepositoryDatabase(connection),
      async createUser() {
        const userId = await insertUser(connection);
        userIds.push(userId);
        return userId;
      },
      async dispose() {
        await connection.query(`delete from users where id = any($1)`, [userIds]);
        await connection.close();
      },
    };
  });

  test("Should delete the sessions of a user that is deleted", async () => {
    const connection = new PgPromiseAdapter(readDatabaseConfig());
    try {
      const repository = new SessionRepositoryDatabase(connection);
      const userId = await insertUser(connection);
      const session = Session.open(
        { userId, tokenHash: randomBytes(32).toString("hex") },
        new Date(),
      );
      await repository.saveSession(session);

      await connection.query(`delete from users where id = $1`, [userId]);

      expect(await repository.getSessionByTokenHash(session.getTokenHash())).toBeNull();
    } finally {
      await connection.close();
    }
  });
});
