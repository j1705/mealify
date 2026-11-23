import RegisterUserUseCase from "../../../../src/application/usecase/auth/RegisterUser";
import Session from "../../../../src/domain/entity/Session";
import {
  EmailAlreadyRegisteredError,
  ValidationError,
} from "../../../../src/domain/error/DomainError";
import { authContext, credentials, now } from "./authFixtures";

describe("RegisterUserUseCase", () => {
  let context: ReturnType<typeof authContext>;
  let registerUser: RegisterUserUseCase;

  beforeEach(() => {
    context = authContext();
    registerUser = new RegisterUserUseCase(
      context.userRepository,
      context.passwordHasher,
      context.sessionStarter,
      context.clock,
    );
  });

  test("Should register the user with the normalized email and open a session", async () => {
    const output = await registerUser.execute({ ...credentials, email: " Ana@Example.com " });

    expect(output).toEqual({ userId: 1, email: "ana@example.com", sessionToken: "token-1" });
  });

  test("Should store only the password hash, stamped with the clock's current time", async () => {
    await registerUser.execute(credentials);

    const user = await context.userRepository.getUserById(1);
    expect(user?.getPasswordHash()).toBe("hashed:correct horse");
    expect(user?.getCreatedAt()).toEqual(now);
  });

  test("Should save a session for the new user, found by the token digest", async () => {
    const { sessionToken } = await registerUser.execute(credentials);

    const session = await context.sessionRepository.getSessionByTokenHash(`digest:${sessionToken}`);
    expect(session?.getUserId()).toBe(1);
    expect(session?.getExpiresAt()).toEqual(new Date(now.getTime() + Session.DURATION_MS));
  });

  test.each([
    [{ ...credentials, email: "ana" }, "Invalid email."],
    [{ ...credentials, password: "short" }, "Password must be at least 8 characters long."],
    [{ ...credentials, password: undefined }, "Password is required."],
  ])("Should reject invalid credentials without saving: %p", async (input, message) => {
    await expect(registerUser.execute(input)).rejects.toThrow(new ValidationError(message));
    expect(await context.userRepository.getUserByEmail(credentials.email)).toBeNull();
  });

  test("Should refuse an email already registered, in any case, without opening a session", async () => {
    await registerUser.execute(credentials);

    await expect(
      registerUser.execute({ ...credentials, email: "ANA@example.com" }),
    ).rejects.toThrow(EmailAlreadyRegisteredError);
    expect(await context.sessionRepository.getSessionByTokenHash("digest:token-2")).toBeNull();
  });
});
