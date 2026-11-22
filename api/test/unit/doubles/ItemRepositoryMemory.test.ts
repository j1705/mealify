import { describeItemRepositoryContract } from "../../contract/itemRepositoryContract";
import ItemRepositoryMemory from "../../doubles/ItemRepositoryMemory";

describe("ItemRepositoryMemory", () => {
  describeItemRepositoryContract(async () => {
    const repository = new ItemRepositoryMemory();
    return {
      repository,
      markAsUsedInMeal: async (itemId) => repository.markAsUsedInMeal(itemId),
      dispose: async () => {},
    };
  });
});
