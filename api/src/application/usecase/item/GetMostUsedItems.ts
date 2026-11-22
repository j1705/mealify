import ItemRepository from "../../repository/ItemRepository";

export default class GetMostUsedItemsUseCase {
  constructor(readonly itemRepository: ItemRepository) {}

  async execute(limit: number): Promise<{ data: OutputMostUsedItem[] }> {
    const ranking = await this.itemRepository.getMostUsedItems(limit);
    return {
      data: ranking.map(({ item, mealCount }) => ({
        id: item.getId()!,
        name: item.getName(),
        unit: item.getUnit(),
        mealCount,
      })),
    };
  }
}

type OutputMostUsedItem = {
  id: number;
  name: string;
  unit: string;
  mealCount: number;
};
