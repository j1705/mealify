import Item from "../../src/domain/entity/Item";
import Meal from "../../src/domain/entity/Meal";
import MealItem from "../../src/domain/entity/MealItem";
import { readDatabaseConfig } from "../../src/infra/database/DatabaseConfig";
import DatabaseConnection, { PgPromiseAdapter } from "../../src/infra/database/DatabaseConnection";
import ItemRepositoryDatabase from "../../src/infra/repositoryDatabase/item/ItemRepositoryDatabase";
import MealRepositoryDatabase from "../../src/infra/repositoryDatabase/meal/MealRepositoryDatabase";
import { describeMealRepositoryContract } from "../contract/mealRepositoryContract";
import { deleteTestUsers, insertTestUser } from "./testUsers";

const uniqueSuffix = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

describe("MealRepositoryDatabase", () => {
  describeMealRepositoryContract(async () => {
    const connection = new PgPromiseAdapter(readDatabaseConfig());
    const itemRepository = new ItemRepositoryDatabase(connection);
    const { itemId } = await itemRepository.saveItem(
      Item.create(
        {
          name: `Contract rice ${uniqueSuffix()}`,
          unit: "g",
          calories: 130,
          carbohydrate: 28,
          protein: 2.7,
          fat: 0.3,
        },
        new Date(),
      ),
    );
    const userIds: number[] = [];
    return {
      repository: new MealRepositoryDatabase(connection),
      persistedItem: (await itemRepository.getItemById(itemId))!,
      async createUser() {
        const userId = await insertTestUser(connection);
        userIds.push(userId);
        return userId;
      },
      async dispose(createdMealIds) {
        await connection.query(`delete from meals where id = any($1)`, [createdMealIds]);
        await deleteTestUsers(connection, userIds);
        await connection.query(`delete from items where id = $1`, [itemId]);
        await connection.close();
      },
    };
  });

  describe("persistence details", () => {
    let connection: DatabaseConnection;
    let itemRepository: ItemRepositoryDatabase;
    let mealRepository: MealRepositoryDatabase;
    const itemIds: number[] = [];
    const mealIds: number[] = [];
    const suffix = uniqueSuffix();
    let userId: number;

    beforeAll(async () => {
      connection = new PgPromiseAdapter(readDatabaseConfig());
      itemRepository = new ItemRepositoryDatabase(connection);
      mealRepository = new MealRepositoryDatabase(connection);
      userId = await insertTestUser(connection);
    });

    afterAll(async () => {
      await connection.query(`delete from meals where id = any($1)`, [mealIds]);
      await deleteTestUsers(connection, [userId]);
      await connection.query(`delete from items where id = any($1)`, [itemIds]);
      await connection.close();
    });

    async function saveItem(name: string) {
      const { itemId } = await itemRepository.saveItem(
        Item.create(
          {
            name: `${name} ${suffix}`,
            unit: "g",
            calories: 100,
            carbohydrate: 14,
            protein: 7,
            fat: 0.5,
          },
          new Date(),
        ),
      );
      itemIds.push(itemId);
      return (await itemRepository.getItemById(itemId))!;
    }

    async function saveMeal(item: Item, quantity: number) {
      const { mealId } = await mealRepository.saveMeal(
        Meal.create(
          {
            userId,
            date: "2026-11-06",
            name: `Dinner ${suffix}`,
            description: null,
            items: [MealItem.create(item, quantity)],
          },
          new Date(),
        ),
      );
      mealIds.push(mealId);
      return mealId;
    }

    test("Should store the meal totals and its items in their own tables", async () => {
      const bean = await saveItem("Bean");

      const mealId = await saveMeal(bean, 150);

      const [savedMeal] = await connection.query<{ calories: string; carbohydrate: string }>(
        `select calories, carbohydrate from meals where id = $1`,
        [mealId],
      );
      const savedItems = await connection.query<{ item_id: number; quantity: string }>(
        `select item_id, quantity from meal_items where meal_id = $1`,
        [mealId],
      );
      expect(Number(savedMeal?.calories)).toBeCloseTo(150);
      expect(Number(savedMeal?.carbohydrate)).toBeCloseTo(21);
      expect(savedItems).toEqual([{ item_id: bean.getId(), quantity: "150" }]);
    });

    test("Should keep the meal snapshot when the item is updated later", async () => {
      const bean = await saveItem("Snapshot bean");
      const mealId = await saveMeal(bean, 200);

      await itemRepository.updateItem(
        new Item({
          id: bean.getId()!,
          name: bean.getName(),
          unit: "g",
          calories: 999,
          carbohydrate: 99,
          protein: 99,
          fat: 99,
          createdAt: bean.getCreatedAt(),
        }),
      );

      const fetchedMeal = await mealRepository.getMealById(userId, mealId);
      expect(fetchedMeal?.getCalories()).toBeCloseTo(200);
      expect(fetchedMeal?.getItems()[0]?.getCalories()).toBeCloseTo(200);
      expect(fetchedMeal?.getItems()[0]?.getMacronutrients().protein).toBeCloseTo(14);
    });

    test.each([0, -1])(
      "Should have the database reject a meal item with quantity %p",
      async (quantity) => {
        const bean = await saveItem(`Check bean ${quantity}`);
        const mealId = await saveMeal(bean, 100);

        await expect(
          connection.query(
            `insert into meal_items (meal_id, item_id, quantity, calories, protein, carbohydrate, fat)
             values ($1, $2, $3, 0, 0, 0, 0)`,
            [mealId, bean.getId(), quantity],
          ),
        ).rejects.toThrow(/meal_items_quantity_positive/);
      },
    );

    test("Should delete the meal items together with the meal", async () => {
      const bean = await saveItem("Cascade bean");
      const mealId = await saveMeal(bean, 40);

      await mealRepository.deleteMeal(userId, mealId);

      const items = await connection.query(`select 1 from meal_items where meal_id = $1`, [mealId]);
      expect(items).toHaveLength(0);
    });

    test("Should delete the meals of a user that is deleted", async () => {
      const bean = await saveItem("Owner bean");
      const ownerId = await insertTestUser(connection);
      const { mealId } = await mealRepository.saveMeal(
        Meal.create(
          {
            userId: ownerId,
            date: "2026-11-06",
            name: `Owned ${suffix}`,
            items: [MealItem.create(bean, 10)],
          },
          new Date(),
        ),
      );
      mealIds.push(mealId);

      await deleteTestUsers(connection, [ownerId]);

      expect(await connection.query(`select 1 from meals where id = $1`, [mealId])).toHaveLength(0);
    });
  });
});
