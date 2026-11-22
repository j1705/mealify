import { ItemNotFoundError } from "../../../domain/error/DomainError";
import ItemRepository from "../../repository/ItemRepository";
import { ItemInput, ItemMutationOutput } from "./ItemMutation";

export default class UpdateItemUseCase {
  constructor(readonly itemRepository: ItemRepository) {}

  async execute(id: number, input: ItemInput): Promise<ItemMutationOutput> {
    const existingItem = await this.itemRepository.getItemById(id);
    if (!existingItem) throw new ItemNotFoundError();
    const item = existingItem.update(input);
    const { itemId } = await this.itemRepository.updateItem(item);
    return {
      message: "Item updated!",
      itemId,
    };
  }
}
