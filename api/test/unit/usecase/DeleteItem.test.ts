import DeleteItemUseCase from "../../../src/application/usecase/item/DeleteItem";
import Item from "../../../src/domain/entity/Item";
import { ConflictError, NotFoundError } from "../../../src/domain/error/DomainError";
import ItemRepositoryMemory from "../../doubles/ItemRepositoryMemory";

describe("DeleteItemUseCase", () => {
  let itemRepository: ItemRepositoryMemory;
  let deleteItem: DeleteItemUseCase;
  let riceId: number;

  beforeEach(async () => {
    itemRepository = new ItemRepositoryMemory();
    deleteItem = new DeleteItemUseCase(itemRepository);
    ({ itemId: riceId } = await itemRepository.saveItem(
      Item.create(
        {
          name: "Rice",
          unit: "g",
          calories: 130,
          carbohydrate: 28,
          protein: 2.7,
          fat: 0.3,
        },
        new Date(),
      ),
    ));
  });

  test("Should delete an item that is not used in any meal", async () => {
    expect(await deleteItem.execute(riceId)).toEqual({ message: "Item deleted!" });
    expect(await itemRepository.getItemById(riceId)).toBeNull();
  });

  test("Should throw if the item is used in a meal", async () => {
    itemRepository.markAsUsedInMeal(riceId);

    await expect(deleteItem.execute(riceId)).rejects.toThrow(
      new ConflictError("Item is used in a meal"),
    );
    expect(await itemRepository.getItemById(riceId)).not.toBeNull();
  });

  test("Should throw if the item does not exist", async () => {
    await expect(deleteItem.execute(999)).rejects.toThrow(NotFoundError);
  });
});
