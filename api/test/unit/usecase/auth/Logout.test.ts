import LogoutUseCase from "../../../../src/application/usecase/auth/Logout";
import { authContext } from "./authFixtures";

describe("LogoutUseCase", () => {
  test("Should delete the session of the given token", async () => {
    const context = authContext();
    const token = await context.sessionStarter.start(1);
    const other = await context.sessionStarter.start(1);

    await new LogoutUseCase(context.sessionRepository, context.sessionTokens).execute(token);

    expect(await context.sessionRepository.getSessionByTokenHash(`digest:${token}`)).toBeNull();
    expect(await context.sessionRepository.getSessionByTokenHash(`digest:${other}`)).not.toBeNull();
  });

  test.each([undefined, "unknown-token"])("Should do nothing for token %p", async (token) => {
    const context = authContext();
    const logout = new LogoutUseCase(context.sessionRepository, context.sessionTokens);

    await expect(logout.execute(token)).resolves.toBeUndefined();
  });
});
