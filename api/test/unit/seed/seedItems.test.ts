import SystemClock from "../../../src/infra/clock/SystemClock";
import { ITEMS, seedItems, toCreateItemProps } from "../../../db/seeds/items";
import Item from "../../../src/domain/entity/Item";
import ItemRepositoryMemory from "../../doubles/ItemRepositoryMemory";

describe("seedItems", () => {
  test("Every seed item should be a valid Item", () => {
    for (const seedItem of ITEMS) {
      expect(() => Item.create(toCreateItemProps(seedItem), new Date())).not.toThrow();
    }
  });

  test("Seed item names should be unique (case-insensitive)", () => {
    const names = ITEMS.map(([name]) => name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  test("Should create all items on an empty repository", async () => {
    const repository = new ItemRepositoryMemory();
    const { created, skipped } = await seedItems(repository, new SystemClock());
    expect(created).toHaveLength(ITEMS.length);
    expect(skipped).toHaveLength(0);
  });

  test("Should skip items already registered, so it can run more than once", async () => {
    const repository = new ItemRepositoryMemory();
    await repository.saveItem(Item.create(toCreateItemProps(ITEMS[0]!), new Date()));

    const first = await seedItems(repository, new SystemClock());
    expect(first.skipped).toEqual([ITEMS[0]![0]]);
    expect(first.created).toHaveLength(ITEMS.length - 1);

    const second = await seedItems(repository, new SystemClock());
    expect(second.created).toHaveLength(0);
    expect(second.skipped).toHaveLength(ITEMS.length);
  });
});
