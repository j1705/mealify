import CreateItemUseCase from "../../../src/application/usecase/item/CreateItem";
import Item from "../../../src/domain/entity/Item";
import { ItemAlreadyRegisteredError } from "../../../src/domain/error/DomainError";
import FixedClock from "../../doubles/FixedClock";
import ItemRepositoryMemory from "../../doubles/ItemRepositoryMemory";

const now = new Date("2026-11-22T12:00:00.000Z");
const rice = { name: "Rice", unit: "g", calories: 130, carbohydrate: 28, protein: 2.7, fat: 0.3 };

describe("CreateItemUseCase", () => {
  let itemRepository: ItemRepositoryMemory;
  let createItem: CreateItemUseCase;

  beforeEach(() => {
    itemRepository = new ItemRepositoryMemory();
    createItem = new CreateItemUseCase(itemRepository, new FixedClock(now));
  });

  test("Should create an item", async () => {
    const output = await createItem.execute(rice);

    expect(output).toEqual({ message: "Item created!", itemId: 1 });
    expect((await itemRepository.getItemById(1))?.getName()).toBe("Rice");
  });

  test("Should stamp the item with the clock's current time", async () => {
    const { itemId } = await createItem.execute(rice);

    expect((await itemRepository.getItemById(itemId))?.getCreatedAt()).toEqual(now);
  });

  test("Should throw if the name is already registered, ignoring case", async () => {
    await itemRepository.saveItem(Item.create(rice, new Date()));

    await expect(createItem.execute({ ...rice, name: "RICE" })).rejects.toThrow(
      ItemAlreadyRegisteredError,
    );
  });

  test("Should validate the item before checking the name", async () => {
    await itemRepository.saveItem(Item.create(rice, new Date()));

    await expect(createItem.execute({ ...rice, calories: -1 })).rejects.toThrow("Invalid Calories");
  });
});
