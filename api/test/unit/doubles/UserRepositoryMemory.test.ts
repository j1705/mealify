import { describeUserRepositoryContract } from "../../contract/userRepositoryContract";
import UserRepositoryMemory from "../../doubles/UserRepositoryMemory";

describe("UserRepositoryMemory", () => {
  describeUserRepositoryContract(async () => ({
    repository: new UserRepositoryMemory(),
    dispose: async () => {},
  }));
});
