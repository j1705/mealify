import { describeItemRepositoryContract } from "../../contract/itemRepositoryContract";
import ItemRepositoryMemory from "../../doubles/ItemRepositoryMemory";

describe("ItemRepositoryMemory", () => {
  describeItemRepositoryContract(async () => {
    const repository = new ItemRepositoryMemory();
    let lastUserId = 0;
    return {
      repository,
      createUser: async () => ++lastUserId,
      markAsUsedInMeal: async (itemId, userId) => repository.markAsUsedInMeal(itemId, userId),
      dispose: async () => {},
    };
  });
});
