import { CredentialsInput, SessionOutput } from "../../application/usecase/auth/AuthInputOutput";
import GetCurrentUserUseCase from "../../application/usecase/auth/GetCurrentUser";
import LoginUseCase from "../../application/usecase/auth/Login";
import LogoutUseCase from "../../application/usecase/auth/Logout";
import RegisterUserUseCase from "../../application/usecase/auth/RegisterUser";
import HttpServer, { HttpResponse } from "../http/HttpServer";
import RequestAuthenticator from "../http/RequestAuthenticator";
import SessionCookie from "../http/SessionCookie";

const NO_BODY = undefined;

export default class AuthController {
  constructor(
    readonly httpServer: HttpServer,
    readonly registerUser: RegisterUserUseCase,
    readonly login: LoginUseCase,
    readonly logout: LogoutUseCase,
    readonly authenticator: RequestAuthenticator,
    readonly getCurrentUser: GetCurrentUserUseCase,
    readonly sessionCookie: SessionCookie,
  ) {
    const respondWithSession = ({ sessionToken, ...user }: SessionOutput) =>
      new HttpResponse(user, [sessionCookie.issue(sessionToken)]);

    httpServer.register(
      "post",
      "/auth/register",
      async ({ body }) => respondWithSession(await registerUser.execute(credentials(body))),
      201,
    );
    httpServer.register("post", "/auth/login", async ({ body }) =>
      respondWithSession(await login.execute(credentials(body))),
    );
    httpServer.register(
      "post",
      "/auth/logout",
      async ({ cookies }) => {
        await logout.execute(sessionCookie.read(cookies));
        return new HttpResponse(NO_BODY, [sessionCookie.clear()]);
      },
      204,
    );
    httpServer.register(
      "get",
      "/auth/me",
      authenticator.guard(async (_request, userId) => getCurrentUser.execute(userId)),
    );
  }
}

function credentials(body: unknown): CredentialsInput {
  return typeof body === "object" && body !== null ? body : {};
}
