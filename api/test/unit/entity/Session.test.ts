import Session from "../../../src/domain/entity/Session";

const openedAt = new Date("2026-11-22T12:00:00.000Z");
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

describe("Session", () => {
  test("Should open a session that lasts thirty days", () => {
    const session = Session.open({ userId: 7, tokenHash: "digest" }, openedAt);

    expect(session.getUserId()).toBe(7);
    expect(session.getTokenHash()).toBe("digest");
    expect(session.getExpiresAt()).toEqual(new Date(openedAt.getTime() + THIRTY_DAYS_MS));
    expect(Session.DURATION_MS).toBe(THIRTY_DAYS_MS);
  });

  test("Should not be expired before its expiration time", () => {
    const session = Session.open({ userId: 7, tokenHash: "digest" }, openedAt);

    expect(session.isExpiredAt(new Date(openedAt.getTime() + THIRTY_DAYS_MS - 1))).toBe(false);
  });

  test("Should be expired from its expiration time on", () => {
    const session = Session.open({ userId: 7, tokenHash: "digest" }, openedAt);

    expect(session.isExpiredAt(new Date(openedAt.getTime() + THIRTY_DAYS_MS))).toBe(true);
  });
});
