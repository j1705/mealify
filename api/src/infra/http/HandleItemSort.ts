import {
  DEFAULT_ITEM_SORT,
  ITEM_SORT_FIELDS,
  ItemSort,
  ItemSortField,
  SORT_ORDERS,
  SortOrder,
} from "../../application/query/ItemListQuery";
import BadRequestError from "./BadRequestError";
import { HttpQuery } from "./HttpServer";

const DEFAULT_ORDER_BY_FIELD: Record<ItemSortField, SortOrder> = {
  name: "asc",
  calories: "asc",
  createdAt: "desc",
};

export default class HandleItemSort {
  private value: ItemSort;

  constructor(query: HttpQuery) {
    const field =
      query.sort === undefined
        ? DEFAULT_ITEM_SORT.field
        : parse(query.sort, ITEM_SORT_FIELDS, "Invalid sort");
    const order =
      query.order === undefined
        ? DEFAULT_ORDER_BY_FIELD[field]
        : parse(query.order, SORT_ORDERS, "Invalid order");
    this.value = { field, order };
  }

  getValue() {
    return this.value;
  }
}

function parse<T extends string>(value: string, allowed: readonly T[], errorMessage: string): T {
  if (!(allowed as readonly string[]).includes(value)) throw new BadRequestError(errorMessage);
  return value as T;
}
