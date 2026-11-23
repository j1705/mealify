import User from "../../../domain/entity/User";
import Email from "../../../domain/vo/Email";
import Password from "../../../domain/vo/Password";
import PasswordHasher from "../../auth/PasswordHasher";
import Clock from "../../clock/Clock";
import UserRepository from "../../repository/UserRepository";
import SessionStarter from "../../service/SessionStarter";
import { CredentialsInput, SessionOutput } from "./AuthInputOutput";

export default class RegisterUserUseCase {
  constructor(
    readonly userRepository: UserRepository,
    readonly passwordHasher: PasswordHasher,
    readonly sessionStarter: SessionStarter,
    readonly clock: Clock,
  ) {}

  async execute(input: CredentialsInput): Promise<SessionOutput> {
    const email = new Email(input.email).getValue();
    const password = new Password(input.password).getValue();
    const passwordHash = await this.passwordHasher.hash(password);
    const { userId } = await this.userRepository.saveUser(
      User.create({ email, passwordHash }, this.clock.now()),
    );
    const sessionToken = await this.sessionStarter.start(userId);
    return { userId, email, sessionToken };
  }
}
