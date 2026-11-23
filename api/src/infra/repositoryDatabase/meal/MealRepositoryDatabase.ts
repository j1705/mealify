import { MealListQuery } from "../../../application/query/MealListQuery";
import MealRepository, { DailyTotals } from "../../../application/repository/MealRepository";
import Meal from "../../../domain/entity/Meal";
import MealItem from "../../../domain/entity/MealItem";
import { MealNotFoundError } from "../../../domain/error/DomainError";
import DatabaseConnection from "../../database/DatabaseConnection";
import QueryParams from "../../database/QueryParams";
import { containsPattern, nameMatchesFilter } from "../nameSearch";

type MealRow = {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  date: string;
  calories: string;
  protein: string;
  carbohydrate: string;
  fat: string;
  created_at: Date;
};

type MealItemRow = {
  meal_id: number;
  item_id: number;
  name: string;
  unit: string;
  quantity: string;
  calories: string;
  protein: string;
  carbohydrate: string;
  fat: string;
};

const MEAL_COLUMNS = [
  "name",
  "description",
  "calories",
  "protein",
  "carbohydrate",
  "fat",
  "date",
] as const;

const MEAL_ITEM_COLUMNS = [
  { name: "item_id", type: "int" },
  { name: "quantity", type: "numeric" },
  { name: "calories", type: "numeric" },
  { name: "protein", type: "numeric" },
  { name: "carbohydrate", type: "numeric" },
  { name: "fat", type: "numeric" },
] as const;

type MealColumn = (typeof MEAL_COLUMNS)[number];
type MealItemColumn = (typeof MEAL_ITEM_COLUMNS)[number]["name"];

const MEAL_ITEM_COLUMN_LIST = MEAL_ITEM_COLUMNS.map((column) => column.name).join(", ");

export default class MealRepositoryDatabase implements MealRepository {
  constructor(readonly connection: DatabaseConnection) {}

  async saveMeal(meal: Meal): Promise<{ mealId: number }> {
    const params = new QueryParams();
    const values = {
      ...mealValues(meal),
      user_id: meal.getUserId(),
      created_at: meal.getCreatedAt(),
    };
    const columns = [...MEAL_COLUMNS, "user_id", "created_at"] as const;
    const placeholders = columns.map((column) => params.add(values[column]));
    const [row] = await this.connection.query<{ id: number }>(
      `with new_meal as (
         insert into meals (${columns.join(", ")})
         values (${placeholders.join(", ")})
         returning id
       ), new_items as (
         ${insertMealItemsOf("new_meal", meal, params)}
       )
       select id from new_meal`,
      params.getValues(),
    );
    return { mealId: row!.id };
  }

  async updateMeal(meal: Meal): Promise<{ mealId: number }> {
    const params = new QueryParams();
    const values = mealValues(meal);
    const assignments = MEAL_COLUMNS.map((column) => `${column} = ${params.add(values[column])}`);
    const [row] = await this.connection.query<{ id: number }>(
      `with updated_meal as (
         update meals
         set ${assignments.join(", ")}
         where id = ${params.add(meal.getId())} and user_id = ${params.add(meal.getUserId())}
         returning id
       ), old_items as (
         delete from meal_items where meal_id = (select id from updated_meal)
       ), new_items as (
         ${insertMealItemsOf("updated_meal", meal, params)}
       )
       select id from updated_meal`,
      params.getValues(),
    );
    if (!row) throw new MealNotFoundError();
    return { mealId: row.id };
  }

  async getMealById(userId: number, mealId: number): Promise<Meal | null> {
    const [meal] = await this.findMeals(`where m.user_id = $1 and m.id = $2`, [userId, mealId]);
    return meal ?? null;
  }

  async getMeals(
    userId: number,
    { page, limit, ...filter }: MealListQuery,
  ): Promise<{ meals: Meal[]; total: number }> {
    const listParams = new QueryParams();
    const listFilter = mealListFilter(userId, filter, listParams);
    const countParams = new QueryParams();
    const countFilter = mealListFilter(userId, filter, countParams);
    const [meals, [count]] = await Promise.all([
      this.findMeals(
        `${listFilter} order by m.date desc, m.id desc
         limit ${listParams.add(limit)} offset ${listParams.add((page - 1) * limit)}`,
        listParams.getValues(),
      ),
      this.connection.query<{ total: number }>(
        `select count(*)::int as total from meals m ${countFilter}`,
        countParams.getValues(),
      ),
    ]);
    return { meals, total: count!.total };
  }

  async getDailyTotals(userId: number, date: string): Promise<DailyTotals> {
    const [row] = await this.connection.query<Record<keyof DailyTotals, number>>(
      `select count(*)::int as "mealCount",
              coalesce(sum(calories), 0)::float8 as calories,
              coalesce(sum(carbohydrate), 0)::float8 as carbohydrate,
              coalesce(sum(protein), 0)::float8 as protein,
              coalesce(sum(fat), 0)::float8 as fat
       from meals
       where user_id = $1 and date = $2::date`,
      [userId, date],
    );
    return row!;
  }

  async deleteMeal(userId: number, mealId: number): Promise<void> {
    await this.connection.query(`delete from meals where user_id = $1 and id = $2`, [
      userId,
      mealId,
    ]);
  }

  private async findMeals(filter: string, params: unknown[]): Promise<Meal[]> {
    const rows = await this.connection.query<MealRow>(
      `select m.id, m.user_id, m.name, m.description, m.date::text as date, m.calories, m.protein,
              m.carbohydrate, m.fat, m.created_at
       from meals m ${filter}`,
      params,
    );
    if (rows.length === 0) return [];
    const itemRows = await this.connection.query<MealItemRow>(
      `select mi.meal_id, mi.item_id, i.name, i.unit, mi.quantity, mi.calories, mi.protein,
              mi.carbohydrate, mi.fat
       from meal_items mi
       join items i on i.id = mi.item_id
       where mi.meal_id = any($1)
       order by mi.id`,
      [rows.map((row) => row.id)],
    );
    const itemRowsByMealId = groupByMealId(itemRows);
    return rows.map((row) => toMeal(row, itemRowsByMealId.get(row.id) ?? []));
  }
}

function mealListFilter(
  userId: number,
  { search, date }: Omit<MealListQuery, "page" | "limit">,
  params: QueryParams,
): string {
  const owner = params.add(userId);
  const day = params.add(date ?? null);
  return `where m.user_id = ${owner}
          and ${nameMatchesFilter(params.add(containsPattern(search)))}
          and (${day}::date is null or m.date = ${day}::date)`;
}

function mealValues(meal: Meal): Record<MealColumn, unknown> {
  return {
    name: meal.getName(),
    description: meal.getDescription(),
    date: meal.getDate(),
    calories: meal.getCalories(),
    ...meal.getMacronutrients(),
  };
}

function mealItemValues(meal: Meal): Record<MealItemColumn, unknown[]> {
  const items = meal.getItems();
  return {
    item_id: items.map((item) => item.getItemId()),
    quantity: items.map((item) => item.getQuantity()),
    calories: items.map((item) => item.getCalories()),
    protein: items.map((item) => item.getMacronutrients().protein),
    carbohydrate: items.map((item) => item.getMacronutrients().carbohydrate),
    fat: items.map((item) => item.getMacronutrients().fat),
  };
}

function insertMealItemsOf(mealSource: string, meal: Meal, params: QueryParams): string {
  const values = mealItemValues(meal);
  const arrays = MEAL_ITEM_COLUMNS.map(
    ({ name, type }) => `${params.add(values[name])}::${type}[]`,
  );
  return `insert into meal_items (meal_id, ${MEAL_ITEM_COLUMN_LIST})
         select ${mealSource}.id, ${MEAL_ITEM_COLUMN_LIST}
         from ${mealSource}, unnest(${arrays.join(", ")}) as x(${MEAL_ITEM_COLUMN_LIST})`;
}

function groupByMealId(itemRows: MealItemRow[]): Map<number, MealItemRow[]> {
  const groups = new Map<number, MealItemRow[]>();
  for (const itemRow of itemRows) {
    const group = groups.get(itemRow.meal_id) ?? [];
    group.push(itemRow);
    groups.set(itemRow.meal_id, group);
  }
  return groups;
}

function toMeal(row: MealRow, itemRows: MealItemRow[]): Meal {
  return new Meal({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    date: row.date,
    items: itemRows.map(toMealItem),
    calories: Number(row.calories),
    carbohydrate: Number(row.carbohydrate),
    protein: Number(row.protein),
    fat: Number(row.fat),
    createdAt: row.created_at,
  });
}

function toMealItem(row: MealItemRow): MealItem {
  return new MealItem({
    itemId: row.item_id,
    name: row.name,
    unit: row.unit,
    quantity: Number(row.quantity),
    calories: Number(row.calories),
    carbohydrate: Number(row.carbohydrate),
    protein: Number(row.protein),
    fat: Number(row.fat),
  });
}
