import GetItemsUseCase from "../../../src/application/usecase/item/GetItems";
import Item from "../../../src/domain/entity/Item";
import ItemRepositoryMemory from "../../doubles/ItemRepositoryMemory";
import { createItemRepositoryWithFood } from "./mealFixtures";

describe("GetItemsUseCase", () => {
  test("Should return a page of items newest first with pagination info", async () => {
    const { itemRepository, eggId } = await createItemRepositoryWithFood();
    const getItems = new GetItemsUseCase(itemRepository);

    const output = await getItems.execute({ page: 1, limit: 1 });

    expect(output.data).toEqual([
      {
        id: eggId,
        name: "Egg",
        unit: "unit",
        calories: 70,
        macronutrients: { carbohydrate: 0.6, protein: 6, fat: 5 },
      },
    ]);
    expect(output.pagination).toEqual({ page: 1, limit: 1, total: 2, totalPages: 2 });
    expect((await getItems.execute({ page: 2, limit: 1 })).data[0]?.name).toBe("Rice");
  });

  test("Should filter by part of the name, ignoring case and accents, and count only matches", async () => {
    const { itemRepository, riceId } = await createItemRepositoryWithFood();
    const getItems = new GetItemsUseCase(itemRepository);

    const output = await getItems.execute({ page: 1, limit: 20, search: "RÍC" });

    expect(output.data.map((item) => item.id)).toEqual([riceId]);
    expect(output.pagination).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
  });

  test("Should return an empty page when nothing matches", async () => {
    const { itemRepository } = await createItemRepositoryWithFood();
    const getItems = new GetItemsUseCase(itemRepository);

    const output = await getItems.execute({ page: 1, limit: 20, search: "banana" });

    expect(output.data).toEqual([]);
    expect(output.pagination.total).toBe(0);
  });

  describe("sorting", () => {
    async function createRepository() {
      const itemRepository = new ItemRepositoryMemory();
      for (const [name, calories] of [
        ["banana", 89],
        ["Árbol chili", 26],
        ["Apple", 96],
        ["Celery", 26],
      ] as const) {
        await itemRepository.saveItem(
          Item.create(
            { name, unit: "g", calories, carbohydrate: 0, protein: 0, fat: 0 },
            new Date(),
          ),
        );
      }
      return new GetItemsUseCase(itemRepository);
    }

    const names = (output: { data: { name: string }[] }) => output.data.map((item) => item.name);

    test("Should sort by name ignoring case and accents", async () => {
      const getItems = await createRepository();

      const asc = await getItems.execute({
        page: 1,
        limit: 20,
        sort: { field: "name", order: "asc" },
      });
      const desc = await getItems.execute({
        page: 1,
        limit: 20,
        sort: { field: "name", order: "desc" },
      });

      expect(names(asc)).toEqual(["Apple", "Árbol chili", "banana", "Celery"]);
      expect(names(desc)).toEqual(["Celery", "banana", "Árbol chili", "Apple"]);
    });

    test("Should sort by calories, breaking ties newest first", async () => {
      const getItems = await createRepository();

      const asc = await getItems.execute({
        page: 1,
        limit: 20,
        sort: { field: "calories", order: "asc" },
      });
      const desc = await getItems.execute({
        page: 1,
        limit: 20,
        sort: { field: "calories", order: "desc" },
      });

      expect(names(asc)).toEqual(["Celery", "Árbol chili", "banana", "Apple"]);
      expect(names(desc)).toEqual(["Apple", "banana", "Celery", "Árbol chili"]);
    });

    test("Should sort before paginating and filtering keeps the order", async () => {
      const getItems = await createRepository();
      const sort = { field: "name", order: "asc" } as const;

      const page2 = await getItems.execute({ page: 2, limit: 2, sort });
      const filtered = await getItems.execute({ page: 1, limit: 20, search: "a", sort });

      expect(names(page2)).toEqual(["banana", "Celery"]);
      expect(page2.pagination).toEqual({ page: 2, limit: 2, total: 4, totalPages: 2 });
      expect(names(filtered)).toEqual(["Apple", "Árbol chili", "banana"]);
    });
  });
});
