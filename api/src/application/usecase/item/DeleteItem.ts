import { ConflictError, ItemNotFoundError } from "../../../domain/error/DomainError";
import ItemRepository from "../../repository/ItemRepository";

export default class DeleteItemUseCase {
  constructor(readonly itemRepository: ItemRepository) {}

  async execute(itemId: number): Promise<OutputDeleteItem> {
    const item = await this.itemRepository.getItemById(itemId);
    if (!item) throw new ItemNotFoundError();
    const isUsedInMeals = await this.itemRepository.isUsedInMeals(itemId);
    if (isUsedInMeals) throw new ConflictError("Item is used in a meal");
    await this.itemRepository.deleteItem(itemId);
    return {
      message: "Item deleted!",
    };
  }
}

type OutputDeleteItem = {
  message: string;
};
