import SessionTokens from "../../auth/SessionTokens";
import SessionRepository from "../../repository/SessionRepository";

export default class LogoutUseCase {
  constructor(
    readonly sessionRepository: SessionRepository,
    readonly sessionTokens: SessionTokens,
  ) {}

  async execute(sessionToken: string | undefined): Promise<void> {
    if (!sessionToken) return;
    await this.sessionRepository.deleteSessionByTokenHash(this.sessionTokens.digest(sessionToken));
  }
}
