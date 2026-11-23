import { AuthenticationRequiredError } from "../../../domain/error/DomainError";
import UserRepository from "../../repository/UserRepository";
import { CurrentUserOutput } from "./AuthInputOutput";

export default class GetCurrentUserUseCase {
  constructor(readonly userRepository: UserRepository) {}

  async execute(userId: number): Promise<CurrentUserOutput> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) throw new AuthenticationRequiredError();
    return { userId, email: user.getEmail() };
  }
}
