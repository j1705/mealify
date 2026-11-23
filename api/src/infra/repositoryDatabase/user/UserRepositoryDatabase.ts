import UserRepository from "../../../application/repository/UserRepository";
import User from "../../../domain/entity/User";
import { EmailAlreadyRegisteredError } from "../../../domain/error/DomainError";
import DatabaseConnection from "../../database/DatabaseConnection";
import { isUniqueViolation } from "../../database/postgresErrors";

type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  created_at: Date;
};

export default class UserRepositoryDatabase implements UserRepository {
  constructor(readonly connection: DatabaseConnection) {}

  async saveUser(user: User): Promise<{ userId: number }> {
    try {
      const [row] = await this.connection.query<{ id: number }>(
        `insert into users (email, password_hash, created_at) values ($1, $2, $3) returning id`,
        [user.getEmail(), user.getPasswordHash(), user.getCreatedAt()],
      );
      return { userId: row!.id };
    } catch (error) {
      if (isUniqueViolation(error)) throw new EmailAlreadyRegisteredError();
      throw error;
    }
  }

  async getUserById(userId: number): Promise<User | null> {
    const [row] = await this.connection.query<UserRow>(`select * from users where id = $1`, [
      userId,
    ]);
    return row ? toUser(row) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [row] = await this.connection.query<UserRow>(
      `select * from users where lower(email) = lower($1)`,
      [email],
    );
    return row ? toUser(row) : null;
  }
}

function toUser(row: UserRow): User {
  return new User({
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  });
}
