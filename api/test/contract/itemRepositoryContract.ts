import { ItemSort } from "../../src/application/query/ItemListQuery";
import { steppingCreationTimes } from "../doubles/steppingCreationTimes";
import ItemRepository from "../../src/application/repository/ItemRepository";
import Item, { CreateItemProps } from "../../src/domain/entity/Item";
import {
  ConflictError,
  ItemAlreadyRegisteredError,
  ItemNotFoundError,
} from "../../src/domain/error/DomainError";

export type ItemRepositoryHarness = {
  repository: ItemRepository;
  markAsUsedInMeal(itemId: number): Promise<void>;
  dispose(createdItemIds: number[]): Promise<void>;
};

const UNKNOWN_ITEM_ID = 2_000_000_000;
const NEWEST_FIRST: ItemSort = { field: "createdAt", order: "desc" };

async function untilNextMillisecond() {
  const start = Date.now();
  while (Date.now() === start) await new Promise((resolve) => setImmediate(resolve));
}

export function describeItemRepositoryContract(
  createHarness: () => Promise<ItemRepositoryHarness>,
) {
  describe("ItemRepository contract", () => {
    let harness: ItemRepositoryHarness;
    let repository: ItemRepository;
    const createdItemIds: number[] = [];
    const runTag = `Contract${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    let nameSequence = 0;
    const uniqueName = (label = "item") => `${runTag} ${label} ${++nameSequence}`;

    const nextCreatedAt = steppingCreationTimes();

    beforeAll(async () => {
      harness = await createHarness();
      repository = harness.repository;
    });

    afterAll(async () => {
      await harness.dispose(createdItemIds);
    });

    async function save(overrides: Partial<CreateItemProps> = {}) {
      const props: CreateItemProps = {
        name: uniqueName(),
        unit: "g",
        calories: 130,
        carbohydrate: 28,
        protein: 2.7,
        fat: 0.3,
        ...overrides,
      };
      const createdAt = nextCreatedAt();
      const { itemId } = await repository.saveItem(Item.create(props, createdAt));
      createdItemIds.push(itemId);
      return { itemId, props, createdAt };
    }

    function changedCopy(item: Item, changes: Partial<CreateItemProps>) {
      return new Item({
        id: item.getId()!,
        name: item.getName(),
        unit: item.getUnit(),
        calories: item.getCalories(),
        ...item.getMacronutrients(),
        createdAt: item.getCreatedAt(),
        ...changes,
      });
    }

    test("Should save an item and read it back by id", async () => {
      const { itemId, props, createdAt } = await save();

      const item = await repository.getItemById(itemId);

      expect(item).toBeInstanceOf(Item);
      expect(item?.getId()).toBe(itemId);
      expect(item?.getName()).toBe(props.name);
      expect(item?.getUnit()).toBe("g");
      expect(item?.getCalories()).toBe(130);
      expect(item?.getMacronutrients()).toEqual({ carbohydrate: 28, protein: 2.7, fat: 0.3 });
      expect(item?.getCreatedAt()).toEqual(createdAt);
    });

    test("Should return null for an unknown id", async () => {
      expect(await repository.getItemById(UNKNOWN_ITEM_ID)).toBeNull();
    });

    test("Should refuse to save a name already registered, ignoring case", async () => {
      const { props } = await save();
      const sameNameUpperCase = Item.create(
        { ...props, name: props.name.toUpperCase() },
        new Date(),
      );

      await expect(repository.saveItem(sameNameUpperCase)).rejects.toThrow(
        ItemAlreadyRegisteredError,
      );
      const { total } = await repository.getItems({
        page: 1,
        limit: 10,
        search: props.name,
        sort: NEWEST_FIRST,
      });
      expect(total).toBe(1);
    });

    test("Should refuse to rename an item to a name already registered, ignoring case", async () => {
      const { props: taken } = await save();
      const { itemId } = await save();
      const saved = (await repository.getItemById(itemId))!;

      await expect(
        repository.updateItem(changedCopy(saved, { name: taken.name.toUpperCase() })),
      ).rejects.toThrow(ItemAlreadyRegisteredError);
      expect((await repository.getItemById(itemId))?.getName()).toBe(saved.getName());
    });

    test("Should let an item be updated keeping its own name in another case", async () => {
      const { itemId, props } = await save();
      const saved = (await repository.getItemById(itemId))!;

      await repository.updateItem(changedCopy(saved, { name: props.name.toUpperCase() }));

      expect((await repository.getItemById(itemId))?.getName()).toBe(props.name.toUpperCase());
    });

    test("Should update an existing item", async () => {
      const { itemId } = await save();
      const saved = (await repository.getItemById(itemId))!;

      const result = await repository.updateItem(changedCopy(saved, { calories: 140 }));

      expect(result).toEqual({ itemId });
      expect((await repository.getItemById(itemId))?.getCalories()).toBe(140);
    });

    test("Should throw ItemNotFoundError when updating an unknown item", async () => {
      const { itemId } = await save();
      const saved = (await repository.getItemById(itemId))!;
      await repository.deleteItem(itemId);

      await expect(repository.updateItem(saved)).rejects.toThrow(ItemNotFoundError);
      expect(await repository.getItemById(itemId)).toBeNull();
    });

    test("Should delete an item", async () => {
      const { itemId } = await save();

      await repository.deleteItem(itemId);

      expect(await repository.getItemById(itemId)).toBeNull();
    });

    test("Should tell whether an item is used in a meal", async () => {
      const { itemId } = await save();
      expect(await repository.isUsedInMeals(itemId)).toBe(false);

      await harness.markAsUsedInMeal(itemId);

      expect(await repository.isUsedInMeals(itemId)).toBe(true);
    });

    test("Should rank the items by how many meals use them, leaving unused ones out", async () => {
      const { itemId: once } = await save();
      const { itemId: thrice } = await save();
      const { itemId: unused } = await save();
      await harness.markAsUsedInMeal(once);
      for (let meal = 0; meal < 3; meal++) await harness.markAsUsedInMeal(thrice);

      const ranking = await repository.getMostUsedItems(100);

      const ours = ranking.filter(({ item }) => [once, thrice, unused].includes(item.getId()!));
      expect(ours.map(({ item, mealCount }) => [item.getId(), mealCount])).toEqual([
        [thrice, 3],
        [once, 1],
      ]);
    });

    test("Should return at most the given number of most used items", async () => {
      const { itemId: first } = await save();
      const { itemId: second } = await save();
      await harness.markAsUsedInMeal(first);
      await harness.markAsUsedInMeal(second);

      expect(await repository.getMostUsedItems(1)).toHaveLength(1);
    });

    test("Should refuse to delete an item used in a meal and keep it", async () => {
      const { itemId } = await save();
      await harness.markAsUsedInMeal(itemId);

      await expect(repository.deleteItem(itemId)).rejects.toThrow(
        new ConflictError("Item is used in a meal"),
      );
      expect(await repository.getItemById(itemId)).not.toBeNull();
      expect(await repository.isUsedInMeals(itemId)).toBe(true);
    });

    test("Should search by part of the name ignoring case and accents, newest first", async () => {
      const searchTag = uniqueName("find");
      const pepper = await save({ name: `${searchTag} Jalapeño pepper` });
      const salsa = await save({ name: `${searchTag} Jalapeno salsa` });
      const rice = await save({ name: `${searchTag} Rice` });
      const createdHere = new Set([pepper.itemId, salsa.itemId, rice.itemId]);

      const { items } = await repository.getItems({
        page: 1,
        limit: 100,
        search: "JALAPEÑO",
        sort: NEWEST_FIRST,
      });

      expect(items.map((item) => item.getId()).filter((id) => createdHere.has(id!))).toEqual([
        salsa.itemId,
        pepper.itemId,
      ]);
    });

    test("Should count only the matching items and paginate them", async () => {
      const searchTag = uniqueName("page");
      const first = await save({ name: `${searchTag} A` });
      const second = await save({ name: `${searchTag} B` });

      const page = (pageNumber: number) =>
        repository.getItems({
          page: pageNumber,
          limit: 1,
          search: searchTag.toUpperCase(),
          sort: NEWEST_FIRST,
        });
      const page1 = await page(1);
      const page2 = await page(2);
      const page3 = await page(3);

      expect(page1.total).toBe(2);
      expect(page1.items.map((item) => item.getId())).toEqual([second.itemId]);
      expect(page2.items.map((item) => item.getId())).toEqual([first.itemId]);
      expect(page3.items).toEqual([]);
    });

    describe("sorting", () => {
      const sortTag = `${runTag} Order`;

      beforeAll(async () => {
        for (const [name, calories] of [
          ["banana", 89],
          ["Árbol chili", 26],
          ["Apple", 96],
          ["Celery", 26],
        ] as const) {
          await save({ name: `${sortTag} ${name}`, calories });
          await untilNextMillisecond();
        }
      });

      async function sortedNames(sort: ItemSort, page = 1, limit = 20) {
        const { items, total } = await repository.getItems({ page, limit, search: sortTag, sort });
        return { names: items.map((item) => item.getName().slice(sortTag.length + 1)), total };
      }

      test.each([
        [{ field: "name", order: "asc" }, ["Apple", "Árbol chili", "banana", "Celery"]],
        [{ field: "name", order: "desc" }, ["Celery", "banana", "Árbol chili", "Apple"]],
        [{ field: "calories", order: "asc" }, ["Celery", "Árbol chili", "banana", "Apple"]],
        [{ field: "calories", order: "desc" }, ["Apple", "banana", "Celery", "Árbol chili"]],
        [{ field: "createdAt", order: "asc" }, ["banana", "Árbol chili", "Apple", "Celery"]],
        [{ field: "createdAt", order: "desc" }, ["Celery", "Apple", "Árbol chili", "banana"]],
      ] as [ItemSort, string[]][])("Should sort by %p", async (sort, expected) => {
        expect((await sortedNames(sort)).names).toEqual(expected);
      });

      test("Should sort before paginating", async () => {
        expect(await sortedNames({ field: "name", order: "asc" }, 2, 2)).toEqual({
          names: ["banana", "Celery"],
          total: 4,
        });
      });
    });
  });
}
