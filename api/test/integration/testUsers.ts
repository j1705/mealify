import DatabaseConnection from "../../src/infra/database/DatabaseConnection";

export async function insertTestUser(connection: DatabaseConnection): Promise<number> {
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const [user] = await connection.query<{ id: number }>(
    `insert into users (email, password_hash) values ($1, 'not-a-real-hash') returning id`,
    [email],
  );
  return user!.id;
}

export async function deleteTestUsers(connection: DatabaseConnection, userIds: number[]) {
  await connection.query(`delete from users where id = any($1)`, [userIds]);
}
