import LoginUseCase from "../../../../src/application/usecase/auth/Login";
import User from "../../../../src/domain/entity/User";
import { InvalidCredentialsError } from "../../../../src/domain/error/DomainError";
import { authContext, credentials, now } from "./authFixtures";

describe("LoginUseCase", () => {
  let context: ReturnType<typeof authContext>;
  let login: LoginUseCase;

  beforeEach(async () => {
    context = authContext();
    await context.userRepository.saveUser(
      User.create(
        {
          email: credentials.email,
          passwordHash: await context.passwordHasher.hash(credentials.password),
        },
        now,
      ),
    );
    login = new LoginUseCase(
      context.userRepository,
      context.passwordHasher,
      context.sessionStarter,
    );
  });

  test("Should log in with the right credentials and open a session", async () => {
    const output = await login.execute(credentials);

    expect(output).toEqual({ userId: 1, email: credentials.email, sessionToken: "token-1" });
    const session = await context.sessionRepository.getSessionByTokenHash("digest:token-1");
    expect(session?.getUserId()).toBe(1);
  });

  test("Should find the user whatever the case and spaces of the email", async () => {
    const output = await login.execute({ ...credentials, email: "  ANA@example.com " });

    expect(output.userId).toBe(1);
  });

  test.each([
    ["a wrong password", { ...credentials, password: "wrong horse" }],
    ["an unknown email", { ...credentials, email: "bia@example.com" }],
    ["a malformed email", { ...credentials, email: "ana" }],
    ["a missing email", { password: credentials.password }],
    ["a missing password", { email: credentials.email }],
  ])("Should answer the same error for %s, without opening a session", async (_case, input) => {
    await expect(login.execute(input)).rejects.toThrow(InvalidCredentialsError);
    expect(await context.sessionRepository.getSessionByTokenHash("digest:token-1")).toBeNull();
  });

  test("Should still verify a password when the email is unknown, so timing does not reveal it", async () => {
    const verify = jest.spyOn(context.passwordHasher, "verify");

    await expect(login.execute({ ...credentials, email: "bia@example.com" })).rejects.toThrow(
      InvalidCredentialsError,
    );

    expect(verify).toHaveBeenCalledTimes(1);
  });
});
