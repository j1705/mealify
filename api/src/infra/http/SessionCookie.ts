import Session from "../../domain/entity/Session";
import { HttpCookie, HttpCookies } from "./HttpServer";

export const SESSION_COOKIE_NAME = "mealify_session";

const MS_PER_SECOND = 1000;
const EXPIRED = 0;

export default class SessionCookie {
  constructor(private readonly secure: boolean) {}

  issue(token: string): HttpCookie {
    return this.build(token, Session.DURATION_MS / MS_PER_SECOND);
  }

  clear(): HttpCookie {
    return this.build("", EXPIRED);
  }

  read(cookies: HttpCookies): string | undefined {
    return cookies[SESSION_COOKIE_NAME];
  }

  private build(value: string, maxAgeSeconds: number): HttpCookie {
    return {
      name: SESSION_COOKIE_NAME,
      value,
      maxAgeSeconds,
      httpOnly: true,
      secure: this.secure,
      sameSite: "lax",
      path: "/",
    };
  }
}
