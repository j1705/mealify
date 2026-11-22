import UpdateItemUseCase from "../../../src/application/usecase/item/UpdateItem";
import Item from "../../../src/domain/entity/Item";
import { ItemAlreadyRegisteredError } from "../../../src/domain/error/DomainError";
import ItemRepositoryMemory from "../../doubles/ItemRepositoryMemory";

const rice = { name: "Rice", unit: "g", calories: 130, carbohydrate: 28, protein: 2.7, fat: 0.3 };

describe("UpdateItemUseCase", () => {
  let itemRepository: ItemRepositoryMemory;
  let updateItem: UpdateItemUseCase;
  let riceId: number;

  beforeEach(async () => {
    itemRepository = new ItemRepositoryMemory();
    updateItem = new UpdateItemUseCase(itemRepository);
    ({ itemId: riceId } = await itemRepository.saveItem(Item.create(rice, new Date())));
  });

  test("Should update an item keeping its own name", async () => {
    const output = await updateItem.execute(riceId, { ...rice, calories: 140 });

    expect(output).toEqual({ message: "Item updated!", itemId: riceId });
    expect((await itemRepository.getItemById(riceId))?.getCalories()).toBe(140);
  });

  test("Should throw if the name belongs to another item", async () => {
    await itemRepository.saveItem(Item.create({ ...rice, name: "Bean" }, new Date()));

    await expect(updateItem.execute(riceId, { ...rice, name: "bean" })).rejects.toThrow(
      ItemAlreadyRegisteredError,
    );
  });
});
