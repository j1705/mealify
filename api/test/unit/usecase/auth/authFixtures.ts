import SessionStarter from "../../../../src/application/service/SessionStarter";
import FakePasswordHasher from "../../../doubles/FakePasswordHasher";
import FixedClock from "../../../doubles/FixedClock";
import SequentialSessionTokens from "../../../doubles/SequentialSessionTokens";
import SessionRepositoryMemory from "../../../doubles/SessionRepositoryMemory";
import UserRepositoryMemory from "../../../doubles/UserRepositoryMemory";

export const now = new Date("2026-11-22T12:00:00.000Z");
export const credentials = { email: "ana@example.com", password: "correct horse" };

export function authContext(clock = new FixedClock(now)) {
  const userRepository = new UserRepositoryMemory();
  const sessionRepository = new SessionRepositoryMemory();
  const passwordHasher = new FakePasswordHasher();
  const sessionTokens = new SequentialSessionTokens();
  const sessionStarter = new SessionStarter(sessionRepository, sessionTokens, clock);
  return {
    clock,
    userRepository,
    sessionRepository,
    passwordHasher,
    sessionTokens,
    sessionStarter,
  };
}
