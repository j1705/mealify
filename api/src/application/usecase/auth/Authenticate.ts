import { AuthenticationRequiredError } from "../../../domain/error/DomainError";
import SessionTokens from "../../auth/SessionTokens";
import Clock from "../../clock/Clock";
import SessionRepository from "../../repository/SessionRepository";

export default class AuthenticateUseCase {
  constructor(
    readonly sessionRepository: SessionRepository,
    readonly sessionTokens: SessionTokens,
    readonly clock: Clock,
  ) {}

  async execute(sessionToken: string | undefined): Promise<number> {
    if (!sessionToken) throw new AuthenticationRequiredError();
    const session = await this.sessionRepository.getSessionByTokenHash(
      this.sessionTokens.digest(sessionToken),
    );
    if (!session || session.isExpiredAt(this.clock.now())) throw new AuthenticationRequiredError();
    return session.getUserId();
  }
}
