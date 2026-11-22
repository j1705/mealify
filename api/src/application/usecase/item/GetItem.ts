import { ItemNotFoundError } from "../../../domain/error/DomainError";
import { ItemOutput, toItemOutput } from "../../mapper/ItemOutputMapper";
import ItemRepository from "../../repository/ItemRepository";

export default class GetItemUseCase {
  constructor(readonly itemRepository: ItemRepository) {}

  async execute(itemId: number): Promise<ItemOutput> {
    const item = await this.itemRepository.getItemById(itemId);
    if (!item) throw new ItemNotFoundError();
    return toItemOutput(item);
  }
}
