import Session from "../../../src/domain/entity/Session";
import SessionCookie, { SESSION_COOKIE_NAME } from "../../../src/infra/http/SessionCookie";

describe("SessionCookie", () => {
  test("Should issue an HttpOnly, SameSite=Lax cookie that lasts as long as the session", () => {
    expect(new SessionCookie(false).issue("token")).toEqual({
      name: SESSION_COOKIE_NAME,
      value: "token",
      maxAgeSeconds: Session.DURATION_MS / 1000,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
  });

  test("Should mark the cookie as Secure when configured to", () => {
    expect(new SessionCookie(true).issue("token").secure).toBe(true);
  });

  test("Should clear the cookie with the same attributes and no lifetime", () => {
    expect(new SessionCookie(true).clear()).toEqual({
      name: SESSION_COOKIE_NAME,
      value: "",
      maxAgeSeconds: 0,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  });

  test("Should read the session token from the request cookies", () => {
    const cookie = new SessionCookie(false);

    expect(cookie.read({ [SESSION_COOKIE_NAME]: "token", other: "x" })).toBe("token");
    expect(cookie.read({ other: "x" })).toBeUndefined();
  });
});
