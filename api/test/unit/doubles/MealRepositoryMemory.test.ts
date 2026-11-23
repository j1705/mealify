import Item from "../../../src/domain/entity/Item";
import { describeMealRepositoryContract } from "../../contract/mealRepositoryContract";
import MealRepositoryMemory from "../../doubles/MealRepositoryMemory";

describe("MealRepositoryMemory", () => {
  let lastUserId = 0;

  describeMealRepositoryContract(async () => ({
    repository: new MealRepositoryMemory(),
    persistedItem: new Item({
      id: 1,
      name: "Rice",
      unit: "g",
      calories: 130,
      carbohydrate: 28,
      protein: 2.7,
      fat: 0.3,
      createdAt: new Date("2026-11-01T00:00:00Z"),
    }),
    createUser: async () => ++lastUserId,
    dispose: async () => {},
  }));
});
