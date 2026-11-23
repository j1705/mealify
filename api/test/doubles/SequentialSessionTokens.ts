import SessionTokens from "../../src/application/auth/SessionTokens";

export default class SequentialSessionTokens implements SessionTokens {
  private sequence = 0;

  generate(): string {
    return `token-${++this.sequence}`;
  }

  digest(token: string): string {
    return `digest:${token}`;
  }
}
