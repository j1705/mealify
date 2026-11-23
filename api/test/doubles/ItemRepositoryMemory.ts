import ItemRepository, { ItemUsage } from "../../src/application/repository/ItemRepository";
import { ItemListQuery, ItemSort, ItemSortField } from "../../src/application/query/ItemListQuery";
import Item from "../../src/domain/entity/Item";
import {
  ConflictError,
  ItemAlreadyRegisteredError,
  ItemNotFoundError,
} from "../../src/domain/error/DomainError";

export default class ItemRepositoryMemory implements ItemRepository {
  private items: Item[] = [];
  private nextId = 1;
  private mealCountsByUserId = new Map<number, Map<number, number>>();

  async saveItem(item: Item): Promise<{ itemId: number }> {
    this.ensureNameIsFree(item);
    const itemId = this.nextId++;
    this.items.push(withId(item, itemId));
    return { itemId };
  }

  async getItems({
    page,
    limit,
    search,
    sort,
  }: ItemListQuery): Promise<{ items: Item[]; total: number }> {
    const term = foldCaseAndAccents(search ?? "");
    const sorted = this.items
      .filter((item) => foldCaseAndAccents(item.getName()).includes(term))
      .sort(compareBy(sort));
    return { items: sorted.slice((page - 1) * limit, page * limit), total: sorted.length };
  }

  async getItemById(itemId: number): Promise<Item | null> {
    return this.items.find((item) => item.getId() === itemId) ?? null;
  }

  markAsUsedInMeal(itemId: number, userId: number) {
    const mealCounts = this.mealCountsOf(userId);
    mealCounts.set(itemId, (mealCounts.get(itemId) ?? 0) + 1);
    this.mealCountsByUserId.set(userId, mealCounts);
  }

  async isUsedInMeals(itemId: number): Promise<boolean> {
    return [...this.mealCountsByUserId.values()].some((mealCounts) => mealCounts.has(itemId));
  }

  async getMostUsedItems(userId: number, limit: number): Promise<ItemUsage[]> {
    const mealCounts = this.mealCountsOf(userId);
    return this.items
      .map((item) => ({ item, mealCount: mealCounts.get(item.getId()!) ?? 0 }))
      .filter(({ mealCount }) => mealCount > 0)
      .sort(
        (a, b) =>
          b.mealCount - a.mealCount ||
          compareText(foldCaseAndAccents(a.item.getName()), foldCaseAndAccents(b.item.getName())) ||
          newestFirst(a.item, b.item),
      )
      .slice(0, limit);
  }

  private mealCountsOf(userId: number): Map<number, number> {
    return this.mealCountsByUserId.get(userId) ?? new Map();
  }

  async updateItem(item: Item): Promise<{ itemId: number }> {
    const index = this.items.findIndex((existing) => existing.getId() === item.getId());
    if (index === -1) throw new ItemNotFoundError();
    this.ensureNameIsFree(item);
    this.items[index] = item;
    return { itemId: item.getId()! };
  }

  private ensureNameIsFree(item: Item) {
    const name = item.getName().toLowerCase();
    const taken = this.items.some(
      (existing) => existing.getId() !== item.getId() && existing.getName().toLowerCase() === name,
    );
    if (taken) throw new ItemAlreadyRegisteredError();
  }

  async deleteItem(itemId: number): Promise<void> {
    if (await this.isUsedInMeals(itemId)) throw new ConflictError("Item is used in a meal");
    this.items = this.items.filter((item) => item.getId() !== itemId);
  }
}

type Comparator = (a: Item, b: Item) => number;

const FIELD_COMPARATORS: Record<ItemSortField, Comparator> = {
  name: (a, b) => compareText(foldCaseAndAccents(a.getName()), foldCaseAndAccents(b.getName())),
  calories: (a, b) => a.getCalories() - b.getCalories(),
  createdAt: (a, b) => a.getCreatedAt().getTime() - b.getCreatedAt().getTime(),
};

const newestFirst: Comparator = (a, b) => b.getId()! - a.getId()!;

function compareBy({ field, order }: ItemSort): Comparator {
  const direction = order === "asc" ? 1 : -1;
  return (a, b) => direction * FIELD_COMPARATORS[field](a, b) || newestFirst(a, b);
}

function compareText(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function foldCaseAndAccents(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function withId(item: Item, id: number): Item {
  return new Item({
    id,
    name: item.getName(),
    unit: item.getUnit(),
    calories: item.getCalories(),
    ...item.getMacronutrients(),
    createdAt: item.getCreatedAt(),
  });
}
