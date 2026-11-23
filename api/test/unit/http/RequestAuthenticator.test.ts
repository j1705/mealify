import AuthenticateUseCase from "../../../src/application/usecase/auth/Authenticate";
import { AuthenticationRequiredError } from "../../../src/domain/error/DomainError";
import { HttpRequest } from "../../../src/infra/http/HttpServer";
import RequestAuthenticator from "../../../src/infra/http/RequestAuthenticator";
import SessionCookie, { SESSION_COOKIE_NAME } from "../../../src/infra/http/SessionCookie";

const USER_ID = 7;

function authenticatorFor(validToken: string) {
  const authenticate = {
    execute: jest.fn(async (token: string | undefined) => {
      if (token !== validToken) throw new AuthenticationRequiredError();
      return USER_ID;
    }),
  };
  const authenticator = new RequestAuthenticator(
    authenticate as unknown as AuthenticateUseCase,
    new SessionCookie(false),
  );
  return { authenticator, authenticate };
}

function requestWith(cookies: Record<string, string>): HttpRequest {
  return { params: { id: "1" }, body: { name: "x" }, query: { page: "1" }, cookies };
}

describe("RequestAuthenticator", () => {
  test("Should hand the route the request and the user of the session cookie", async () => {
    const { authenticator, authenticate } = authenticatorFor("good-token");
    const route = jest.fn(async () => "answer");
    const request = requestWith({ [SESSION_COOKIE_NAME]: "good-token" });

    const output = await authenticator.guard(route)(request);

    expect(output).toBe("answer");
    expect(route).toHaveBeenCalledWith(request, USER_ID);
    expect(authenticate.execute).toHaveBeenCalledWith("good-token");
  });

  test.each([{}, { [SESSION_COOKIE_NAME]: "bad-token" }, { other: "good-token" }])(
    "Should refuse the request without reaching the route for cookies %p",
    async (cookies) => {
      const { authenticator } = authenticatorFor("good-token");
      const route = jest.fn();

      await expect(authenticator.guard(route)(requestWith(cookies))).rejects.toThrow(
        AuthenticationRequiredError,
      );
      expect(route).not.toHaveBeenCalled();
    },
  );
});
