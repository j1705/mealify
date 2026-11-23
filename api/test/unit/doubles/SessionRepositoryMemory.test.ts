import { describeSessionRepositoryContract } from "../../contract/sessionRepositoryContract";
import SessionRepositoryMemory from "../../doubles/SessionRepositoryMemory";

const ANY_USER_ID = 1;

describe("SessionRepositoryMemory", () => {
  describeSessionRepositoryContract(async () => ({
    repository: new SessionRepositoryMemory(),
    createUser: async () => ANY_USER_ID,
    dispose: async () => {},
  }));
});
