import { randomBytes } from "node:crypto";
import Session from "../../src/domain/entity/Session";
import { readDatabaseConfig } from "../../src/infra/database/DatabaseConfig";
import { PgPromiseAdapter } from "../../src/infra/database/DatabaseConnection";
import SessionRepositoryDatabase from "../../src/infra/repositoryDatabase/session/SessionRepositoryDatabase";
import { describeSessionRepositoryContract } from "../contract/sessionRepositoryContract";
import { deleteTestUsers, insertTestUser } from "./testUsers";

describe("SessionRepositoryDatabase", () => {
  describeSessionRepositoryContract(async () => {
    const connection = new PgPromiseAdapter(readDatabaseConfig());
    const userIds: number[] = [];
    return {
      repository: new SessionRepositoryDatabase(connection),
      async createUser() {
        const userId = await insertTestUser(connection);
        userIds.push(userId);
        return userId;
      },
      async dispose() {
        await deleteTestUsers(connection, userIds);
        await connection.close();
      },
    };
  });

  test("Should delete the sessions of a user that is deleted", async () => {
    const connection = new PgPromiseAdapter(readDatabaseConfig());
    try {
      const repository = new SessionRepositoryDatabase(connection);
      const userId = await insertTestUser(connection);
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
