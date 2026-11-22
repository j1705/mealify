import GetMostUsedItemsUseCase from "../../../src/application/usecase/item/GetMostUsedItems";
import Item from "../../../src/domain/entity/Item";
import ItemRepositoryMemory from "../../doubles/ItemRepositoryMemory";

const food = { unit: "g", calories: 100, carbohydrate: 1, protein: 1, fat: 1 };

describe("GetMostUsedItemsUseCase", () => {
  test("Should list the most used items with their meal count", async () => {
    const itemRepository = new ItemRepositoryMemory();
    const { itemId: rice } = await itemRepository.saveItem(
      Item.create({ ...food, name: "Rice" }, new Date()),
    );
    const { itemId: egg } = await itemRepository.saveItem(
      Item.create({ ...food, name: "Egg", unit: "unit" }, new Date()),
    );
    itemRepository.markAsUsedInMeal(rice);
    itemRepository.markAsUsedInMeal(egg);
    itemRepository.markAsUsedInMeal(egg);

    const output = await new GetMostUsedItemsUseCase(itemRepository).execute(5);

    expect(output).toEqual({
      data: [
        { id: egg, name: "Egg", unit: "unit", mealCount: 2 },
        { id: rice, name: "Rice", unit: "g", mealCount: 1 },
      ],
    });
  });
});
