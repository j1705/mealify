import Clock from "../../clock/Clock";
import Item from "../../../domain/entity/Item";
import ItemRepository from "../../repository/ItemRepository";
import { ItemInput, ItemMutationOutput } from "./ItemMutation";

export default class CreateItemUseCase {
  constructor(
    readonly itemRepository: ItemRepository,
    readonly clock: Clock,
  ) {}

  async execute(input: ItemInput): Promise<ItemMutationOutput> {
    const item = Item.create(input, this.clock.now());
    const { itemId } = await this.itemRepository.saveItem(item);
    return {
      message: "Item created!",
      itemId,
    };
  }
}
