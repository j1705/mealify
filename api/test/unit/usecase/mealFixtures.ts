import { ItemReader } from "../../../src/application/repository/ItemRepository";
import Item from "../../../src/domain/entity/Item";
import ItemRepositoryMemory from "../../doubles/ItemRepositoryMemory";

const rice = { name: "Rice", unit: "g", calories: 130, carbohydrate: 28, protein: 2.7, fat: 0.3 };
const egg = { name: "Egg", unit: "unit", calories: 70, carbohydrate: 0.6, protein: 6, fat: 5 };

export async function createItemRepositoryWithFood() {
  const itemRepository = new ItemRepositoryMemory();
  const { itemId: riceId } = await itemRepository.saveItem(Item.create(rice, new Date()));
  const { itemId: eggId } = await itemRepository.saveItem(Item.create(egg, new Date()));
  return { itemRepository, riceId, eggId };
}

export function createItemReaderWithFood() {
  const riceId = 1;
  const eggId = 2;
  const createdAt = new Date("2026-11-01T00:00:00Z");
  const items = [
    new Item({ ...rice, id: riceId, createdAt }),
    new Item({ ...egg, id: eggId, createdAt }),
  ];
  const itemReader: ItemReader = {
    getItemById: async (itemId) => items.find((item) => item.getId() === itemId) ?? null,
  };
  return { itemReader, riceId, eggId };
}
