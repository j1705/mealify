import Item from "../../src/domain/entity/Item";
import { ItemAlreadyRegisteredError } from "../../src/domain/error/DomainError";
import { readDatabaseConfig } from "../../src/infra/database/DatabaseConfig";
import DatabaseConnection, { PgPromiseAdapter } from "../../src/infra/database/DatabaseConnection";
import ItemRepositoryDatabase from "../../src/infra/repositoryDatabase/item/ItemRepositoryDatabase";
import { describeItemRepositoryContract } from "../contract/itemRepositoryContract";
import { deleteTestUsers, insertTestUser } from "./testUsers";

describe("ItemRepositoryDatabase", () => {
  describeItemRepositoryContract(async () => {
    const connection = new PgPromiseAdapter(readDatabaseConfig());
    const mealIdsUsingItems: number[] = [];
    const userIds: number[] = [];
    return {
      repository: new ItemRepositoryDatabase(connection),
      async createUser() {
        const userId = await insertTestUser(connection);
        userIds.push(userId);
        return userId;
      },
      async markAsUsedInMeal(itemId, userId) {
        const [meal] = await connection.query<{ id: number }>(
          `insert into meals (user_id, name, date, calories, protein, carbohydrate, fat)
           values ($1, 'Contract meal', current_date, 0, 0, 0, 0) returning id`,
          [userId],
        );
        mealIdsUsingItems.push(meal!.id);
        await connection.query(
          `insert into meal_items (meal_id, item_id, quantity, calories, protein, carbohydrate, fat)
           values ($1, $2, 100, 0, 0, 0, 0)`,
          [meal!.id, itemId],
        );
      },
      async dispose(createdItemIds) {
        await connection.query(`delete from meals where id = any($1)`, [mealIdsUsingItems]);
        await deleteTestUsers(connection, userIds);
        await connection.query(`delete from items where id = any($1)`, [createdItemIds]);
        await connection.close();
      },
    };
  });

  describe("unique name under concurrency", () => {
    let connection: DatabaseConnection;
    let repository: ItemRepositoryDatabase;
    const name = `Concurrent${Date.now()}${Math.random().toString(36).slice(2, 6)}`;

    beforeAll(() => {
      connection = new PgPromiseAdapter(readDatabaseConfig());
      repository = new ItemRepositoryDatabase(connection);
    });

    afterAll(async () => {
      await connection.query(`delete from items where lower(name) = lower($1)`, [name]);
      await connection.close();
    });

    test("Should keep only one of two simultaneous saves with the same name", async () => {
      const props = { unit: "g", calories: 100, carbohydrate: 1, protein: 1, fat: 1 };

      const results = await Promise.allSettled([
        repository.saveItem(Item.create({ ...props, name }, new Date())),
        repository.saveItem(Item.create({ ...props, name: name.toLowerCase() }, new Date())),
      ]);

      expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      const [rejected] = results.filter((result) => result.status === "rejected");
      expect(rejected?.reason).toBeInstanceOf(ItemAlreadyRegisteredError);
    });
  });

  describe("LIKE wildcards", () => {
    let connection: DatabaseConnection;
    let repository: ItemRepositoryDatabase;
    const createdIds: number[] = [];
    const uniqueTag = `Wildcard${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    const newestFirst = { sort: { field: "createdAt", order: "desc" } } as const;

    beforeAll(() => {
      connection = new PgPromiseAdapter(readDatabaseConfig());
      repository = new ItemRepositoryDatabase(connection);
    });

    afterAll(async () => {
      await connection.query(`delete from items where id = any($1)`, [createdIds]);
      await connection.close();
    });

    async function saveNamed(name: string) {
      const { itemId } = await repository.saveItem(
        Item.create(
          { name, unit: "g", calories: 100, carbohydrate: 1, protein: 1, fat: 1 },
          new Date(),
        ),
      );
      createdIds.push(itemId);
      return itemId;
    }

    test("Should not treat % and _ in the name uniqueness as wildcards", async () => {
      const name = `${uniqueTag} name`;
      await saveNamed(name);

      await expect(saveNamed(name.slice(0, -1) + "_")).resolves.toEqual(expect.any(Number));
      await expect(saveNamed(name.slice(0, 5) + "%")).resolves.toEqual(expect.any(Number));
    });

    test("Should treat %, _ and \\ in the search term literally", async () => {
      const percent = await saveNamed(`${uniqueTag} 100% integral`);
      await saveNamed(`${uniqueTag} 1000 integral`);
      const underscore = await saveNamed(`${uniqueTag} a_b`);
      await saveNamed(`${uniqueTag} axb`);
      const backslash = await saveNamed(`${uniqueTag} c\\d`);

      const ids = async (search: string) =>
        (await repository.getItems({ ...newestFirst, page: 1, limit: 20, search })).items.map((i) =>
          i.getId(),
        );

      expect(await ids(`${uniqueTag} 100%`)).toEqual([percent]);
      expect(await ids(`${uniqueTag} a_b`)).toEqual([underscore]);
      expect(await ids(`${uniqueTag} c\\d`)).toEqual([backslash]);
    });
  });
});
