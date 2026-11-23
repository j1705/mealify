import User from "../../domain/entity/User";

export default interface UserRepository {
  saveUser(user: User): Promise<{ userId: number }>;
  getUserById(userId: number): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
}
