import UserRepository from "../../src/application/repository/UserRepository";
import User from "../../src/domain/entity/User";
import { EmailAlreadyRegisteredError } from "../../src/domain/error/DomainError";

export default class UserRepositoryMemory implements UserRepository {
  private users: User[] = [];
  private nextId = 1;

  async saveUser(user: User): Promise<{ userId: number }> {
    if (await this.getUserByEmail(user.getEmail())) throw new EmailAlreadyRegisteredError();
    const userId = this.nextId++;
    this.users.push(withId(user, userId));
    return { userId };
  }

  async getUserById(userId: number): Promise<User | null> {
    return this.users.find((user) => user.getId() === userId) ?? null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const wanted = email.toLowerCase();
    return this.users.find((user) => user.getEmail() === wanted) ?? null;
  }
}

function withId(user: User, id: number): User {
  return new User({
    id,
    email: user.getEmail(),
    passwordHash: user.getPasswordHash(),
    createdAt: user.getCreatedAt(),
  });
}
