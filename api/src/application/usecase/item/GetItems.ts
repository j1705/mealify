import { ItemOutput, toItemOutput } from "../../mapper/ItemOutputMapper";
import { PaginatedOutput, toPaginatedOutput } from "../../mapper/PaginationMapper";
import { DEFAULT_ITEM_SORT, ItemListQuery } from "../../query/ItemListQuery";
import ItemRepository from "../../repository/ItemRepository";

export default class GetItemsUseCase {
  constructor(readonly itemRepository: ItemRepository) {}

  async execute({
    sort = DEFAULT_ITEM_SORT,
    ...query
  }: InputGetItems): Promise<PaginatedOutput<ItemOutput>> {
    const { items, total } = await this.itemRepository.getItems({ ...query, sort });
    return toPaginatedOutput(items.map(toItemOutput), total, query);
  }
}

export type InputGetItems = Omit<ItemListQuery, "sort"> & Partial<Pick<ItemListQuery, "sort">>;
