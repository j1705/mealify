import GetCurrentUserUseCase from "../../../../src/application/usecase/auth/GetCurrentUser";
import User from "../../../../src/domain/entity/User";
import { AuthenticationRequiredError } from "../../../../src/domain/error/DomainError";
import UserRepositoryMemory from "../../../doubles/UserRepositoryMemory";
import { now } from "./authFixtures";

describe("GetCurrentUserUseCase", () => {
  test("Should answer the id and email of the user, never the password hash", async () => {
    const userRepository = new UserRepositoryMemory();
    const { userId } = await userRepository.saveUser(
      User.create({ email: "ana@example.com", passwordHash: "hash" }, now),
    );

    const output = await new GetCurrentUserUseCase(userRepository).execute(userId);

    expect(output).toEqual({ userId, email: "ana@example.com" });
  });

  test("Should require authentication again if the user no longer exists", async () => {
    const getCurrentUser = new GetCurrentUserUseCase(new UserRepositoryMemory());

    await expect(getCurrentUser.execute(1)).rejects.toThrow(AuthenticationRequiredError);
  });
});
