import PasswordHasher from "../../src/application/auth/PasswordHasher";

const PREFIX = "hashed:";

export default class FakePasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return `${PREFIX}${password}`;
  }

  async verify(password: string, passwordHash: string): Promise<boolean> {
    return passwordHash === `${PREFIX}${password}`;
  }
}
