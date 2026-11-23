import Item from "../../domain/entity/Item";
import { ItemListQuery } from "../query/ItemListQuery";

export type ItemUsage = { item: Item; mealCount: number };

export interface ItemReader {
  getItemById(itemId: number): Promise<Item | null>;
}

export default interface ItemRepository extends ItemReader {
  saveItem(item: Item): Promise<{ itemId: number }>;
  getItems(query: ItemListQuery): Promise<{ items: Item[]; total: number }>;
  isUsedInMeals(itemId: number): Promise<boolean>;
  getMostUsedItems(userId: number, limit: number): Promise<ItemUsage[]>;
  updateItem(item: Item): Promise<{ itemId: number }>;
  deleteItem(itemId: number): Promise<void>;
}
