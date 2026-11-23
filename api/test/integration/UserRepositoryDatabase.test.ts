import User from "../../src/domain/entity/User";
import { EmailAlreadyRegisteredError } from "../../src/domain/error/DomainError";
import { readDatabaseConfig } from "../../src/infra/database/DatabaseConfig";
import DatabaseConnection, { PgPromiseAdapter } from "../../src/infra/database/DatabaseConnection";
import UserRepositoryDatabase from "../../src/infra/repositoryDatabase/user/UserRepositoryDatabase";
import { describeUserRepositoryContract } from "../contract/userRepositoryContract";

describe("UserRepositoryDatabase", () => {
  describeUserRepositoryContract(async () => {
    const connection = new PgPromiseAdapter(readDatabaseConfig());
    return {
      repository: new UserRepositoryDatabase(connection),
      async dispose(createdUserIds) {
        await connection.query(`delete from users where id = any($1)`, [createdUserIds]);
        await connection.close();
      },
    };
  });

  describe("unique email under concurrency", () => {
    let connection: DatabaseConnection;
    const email = `concurrent${Date.now()}${Math.random().toString(36).slice(2, 6)}@example.com`;

    beforeAll(() => {
      connection = new PgPromiseAdapter(readDatabaseConfig());
    });

    afterAll(async () => {
      await connection.query(`delete from users where email = $1`, [email]);
      await connection.close();
    });

    test("Should keep only one of two simultaneous registrations of the same email", async () => {
      const repository = new UserRepositoryDatabase(connection);
      const register = () =>
        repository.saveUser(User.create({ email, passwordHash: "hash" }, new Date()));

      const results = await Promise.allSettled([register(), register()]);

      expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      const [rejected] = results.filter((result) => result.status === "rejected");
      expect((rejected as PromiseRejectedResult).reason).toBeInstanceOf(
        EmailAlreadyRegisteredError,
      );
    });
  });
});
