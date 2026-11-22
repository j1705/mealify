import MealItem from "../../domain/entity/MealItem";
import { ItemNotFoundError } from "../../domain/error/DomainError";
import Quantity from "../../domain/vo/Quantity";
import { ItemReader } from "../repository/ItemRepository";

export type InputMealItem = {
  itemId: number;
  quantity: number;
};

export default async function buildMealItems(
  itemReader: ItemReader,
  items: InputMealItem[],
): Promise<MealItem[]> {
  const validated = items.map(({ itemId, quantity }) => ({
    itemId,
    quantity: new Quantity(quantity).getValue(),
  }));
  const mealItems: MealItem[] = [];
  for (const { itemId, quantity } of validated) {
    const item = await itemReader.getItemById(itemId);
    if (!item) throw new ItemNotFoundError();
    mealItems.push(MealItem.create(item, quantity));
  }
  return mealItems;
}
