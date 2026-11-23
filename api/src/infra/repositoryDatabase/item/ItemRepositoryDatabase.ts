import ItemRepository, { ItemUsage } from "../../../application/repository/ItemRepository";
import { ItemListQuery, ItemSort, ItemSortField } from "../../../application/query/ItemListQuery";
import Item from "../../../domain/entity/Item";
import {
  ConflictError,
  ItemAlreadyRegisteredError,
  ItemNotFoundError,
} from "../../../domain/error/DomainError";
import DatabaseConnection from "../../database/DatabaseConnection";
import { isForeignKeyViolation, isUniqueViolation } from "../../database/postgresErrors";
import { containsPattern, nameMatchesFilter } from "../nameSearch";

type ItemRow = {
  id: number;
  name: string;
  unit: string;
  calories: string;
  protein: string;
  carbohydrate: string;
  fat: string;
  created_at: Date;
};

export default class ItemRepositoryDatabase implements ItemRepository {
  constructor(readonly connection: DatabaseConnection) {}

  async saveItem(item: Item): Promise<{ itemId: number }> {
    const { carbohydrate, protein, fat } = item.getMacronutrients();
    const [row] = await this.queryTranslatingDuplicateName<{ id: number }>(
      `insert into items (name, unit, calories, protein, carbohydrate, fat, created_at)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning id`,
      [
        item.getName(),
        item.getUnit(),
        item.getCalories(),
        protein,
        carbohydrate,
        fat,
        item.getCreatedAt(),
      ],
    );
    return { itemId: row!.id };
  }

  async getItems({
    page,
    limit,
    search,
    sort,
  }: ItemListQuery): Promise<{ items: Item[]; total: number }> {
    const pattern = containsPattern(search);
    const [rows, [count]] = await Promise.all([
      this.connection.query<ItemRow>(
        `select * from items where ${nameMatchesFilter("$1")} order by ${orderBy(sort)}
         limit $2 offset $3`,
        [pattern, limit, (page - 1) * limit],
      ),
      this.connection.query<{ total: number }>(
        `select count(*)::int as total from items where ${nameMatchesFilter("$1")}`,
        [pattern],
      ),
    ]);
    return { items: rows.map(toItem), total: count!.total };
  }

  async isUsedInMeals(itemId: number): Promise<boolean> {
    const [row] = await this.connection.query<{ exists: boolean }>(
      `select exists (select 1 from meal_items where item_id = $1) as "exists"`,
      [itemId],
    );
    return row!.exists;
  }

  async getItemById(itemId: number): Promise<Item | null> {
    const [row] = await this.connection.query<ItemRow>(`select * from items where id = $1`, [
      itemId,
    ]);
    return row ? toItem(row) : null;
  }

  async getMostUsedItems(limit: number): Promise<ItemUsage[]> {
    const rows = await this.connection.query<ItemRow & { meal_count: number }>(
      `select i.*, count(distinct mi.meal_id)::int as meal_count
       from items i
       join meal_items mi on mi.item_id = i.id
       group by i.id
       order by meal_count desc, ${SORT_COLUMNS.name} asc, i.id desc
       limit $1`,
      [limit],
    );
    return rows.map((row) => ({ item: toItem(row), mealCount: row.meal_count }));
  }

  async updateItem(item: Item): Promise<{ itemId: number }> {
    const { carbohydrate, protein, fat } = item.getMacronutrients();
    const [row] = await this.queryTranslatingDuplicateName<{ id: number }>(
      `update items
       set name = $1, unit = $2, calories = $3, protein = $4, carbohydrate = $5, fat = $6
       where id = $7
       returning id`,
      [
        item.getName(),
        item.getUnit(),
        item.getCalories(),
        protein,
        carbohydrate,
        fat,
        item.getId(),
      ],
    );
    if (!row) throw new ItemNotFoundError();
    return { itemId: row.id };
  }

  async deleteItem(itemId: number): Promise<void> {
    try {
      await this.connection.query(`delete from items where id = $1`, [itemId]);
    } catch (error) {
      if (isForeignKeyViolation(error)) throw new ConflictError("Item is used in a meal");
      throw error;
    }
  }

  private async queryTranslatingDuplicateName<T>(statement: string, params: unknown[]) {
    try {
      return await this.connection.query<T>(statement, params);
    } catch (error) {
      if (isUniqueViolation(error)) throw new ItemAlreadyRegisteredError();
      throw error;
    }
  }
}

const SORT_COLUMNS: Record<ItemSortField, string> = {
  name: "lower(unaccent(name))",
  calories: "calories",
  createdAt: "created_at",
};

const NEWEST_FIRST = "id desc";

function orderBy({ field, order }: ItemSort): string {
  return `${SORT_COLUMNS[field]} ${order === "asc" ? "asc" : "desc"}, ${NEWEST_FIRST}`;
}

function toItem(row: ItemRow): Item {
  return new Item({
    id: row.id,
    name: row.name,
    unit: row.unit,
    calories: Number(row.calories),
    carbohydrate: Number(row.carbohydrate),
    protein: Number(row.protein),
    fat: Number(row.fat),
    createdAt: row.created_at,
  });
}
