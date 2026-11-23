const MS_PER_DAY = 24 * 60 * 60 * 1000;
const SESSION_DAYS = 30;

export type SessionProps = {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
};

export type OpenSessionProps = Omit<SessionProps, "expiresAt">;

export default class Session {
  private userId: number;
  private tokenHash: string;
  private expiresAt: Date;

  static readonly DURATION_MS = SESSION_DAYS * MS_PER_DAY;

  constructor({ userId, tokenHash, expiresAt }: SessionProps) {
    this.userId = userId;
    this.tokenHash = tokenHash;
    this.expiresAt = expiresAt;
  }

  static open(props: OpenSessionProps, openedAt: Date) {
    return new Session({ ...props, expiresAt: new Date(openedAt.getTime() + Session.DURATION_MS) });
  }

  isExpiredAt(moment: Date) {
    return moment.getTime() >= this.expiresAt.getTime();
  }

  getUserId() {
    return this.userId;
  }

  getTokenHash() {
    return this.tokenHash;
  }

  getExpiresAt() {
    return this.expiresAt;
  }
}
