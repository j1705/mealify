import AuthenticateUseCase from "../../../../src/application/usecase/auth/Authenticate";
import Session from "../../../../src/domain/entity/Session";
import { AuthenticationRequiredError } from "../../../../src/domain/error/DomainError";
import FixedClock from "../../../doubles/FixedClock";
import { authContext, now } from "./authFixtures";

describe("AuthenticateUseCase", () => {
  function authenticateAt(moment: Date) {
    const context = authContext();
    const authenticate = new AuthenticateUseCase(
      context.sessionRepository,
      context.sessionTokens,
      new FixedClock(moment),
    );
    return { context, authenticate };
  }

  test("Should answer the user id of a valid session", async () => {
    const { context, authenticate } = authenticateAt(now);
    const token = await context.sessionStarter.start(7);

    expect(await authenticate.execute(token)).toBe(7);
  });

  test("Should accept a session right before it expires", async () => {
    const { context, authenticate } = authenticateAt(
      new Date(now.getTime() + Session.DURATION_MS - 1),
    );
    const token = await context.sessionStarter.start(7);

    expect(await authenticate.execute(token)).toBe(7);
  });

  test("Should refuse an expired session", async () => {
    const { context, authenticate } = authenticateAt(new Date(now.getTime() + Session.DURATION_MS));
    const token = await context.sessionStarter.start(7);

    await expect(authenticate.execute(token)).rejects.toThrow(AuthenticationRequiredError);
  });

  test.each([undefined, "", "unknown-token"])("Should refuse token %p", async (token) => {
    const { authenticate } = authenticateAt(now);

    await expect(authenticate.execute(token)).rejects.toThrow(AuthenticationRequiredError);
  });
});
