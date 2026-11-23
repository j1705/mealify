import AuthenticateUseCase from "../../application/usecase/auth/Authenticate";
import { HttpCallback, HttpRequest } from "./HttpServer";
import SessionCookie from "./SessionCookie";

export type AuthenticatedCallback = (request: HttpRequest, userId: number) => Promise<unknown>;

export default class RequestAuthenticator {
  constructor(
    readonly authenticate: AuthenticateUseCase,
    readonly sessionCookie: SessionCookie,
  ) {}

  guard(route: AuthenticatedCallback): HttpCallback {
    return async (request) => {
      const userId = await this.authenticate.execute(this.sessionCookie.read(request.cookies));
      return route(request, userId);
    };
  }
}
