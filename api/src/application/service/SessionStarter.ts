import Session from "../../domain/entity/Session";
import SessionTokens from "../auth/SessionTokens";
import Clock from "../clock/Clock";
import SessionRepository from "../repository/SessionRepository";

export default class SessionStarter {
  constructor(
    readonly sessionRepository: SessionRepository,
    readonly sessionTokens: SessionTokens,
    readonly clock: Clock,
  ) {}

  async start(userId: number): Promise<string> {
    const token = this.sessionTokens.generate();
    const tokenHash = this.sessionTokens.digest(token);
    await this.sessionRepository.saveSession(Session.open({ userId, tokenHash }, this.clock.now()));
    return token;
  }
}
