import User from "../../../domain/entity/User";
import { InvalidCredentialsError } from "../../../domain/error/DomainError";
import PasswordHasher from "../../auth/PasswordHasher";
import UserRepository from "../../repository/UserRepository";
import SessionStarter from "../../service/SessionStarter";
import { CredentialsInput, SessionOutput } from "./AuthInputOutput";

const PASSWORD_FOR_UNKNOWN_EMAIL = "password-checked-only-to-spend-the-same-time";

export default class LoginUseCase {
  private hashForUnknownEmail: Promise<string> | undefined;

  constructor(
    readonly userRepository: UserRepository,
    readonly passwordHasher: PasswordHasher,
    readonly sessionStarter: SessionStarter,
  ) {}

  async execute({ email, password }: CredentialsInput): Promise<SessionOutput> {
    const user = await this.findUser(email);
    const passwordMatches = await this.passwordHasher.verify(
      typeof password === "string" ? password : "",
      user?.getPasswordHash() ?? (await this.passwordHashForUnknownEmail()),
    );
    if (!user || !passwordMatches) throw new InvalidCredentialsError();
    const userId = user.getId()!;
    const sessionToken = await this.sessionStarter.start(userId);
    return { userId, email: user.getEmail(), sessionToken };
  }

  private async findUser(email: unknown): Promise<User | null> {
    if (typeof email !== "string") return null;
    return this.userRepository.getUserByEmail(email.trim());
  }

  private passwordHashForUnknownEmail(): Promise<string> {
    this.hashForUnknownEmail ??= this.passwordHasher.hash(PASSWORD_FOR_UNKNOWN_EMAIL);
    return this.hashForUnknownEmail;
  }
}
