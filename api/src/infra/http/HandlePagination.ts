import { PaginationInput } from "../../application/query/PaginationQuery";
import BadRequestError from "./BadRequestError";
import { HttpQuery } from "./HttpServer";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export default class HandlePagination {
  private value: PaginationInput;

  constructor(query: HttpQuery) {
    this.value = {
      page: parsePositiveInteger(query.page, DEFAULT_PAGE, "Invalid page"),
      limit: parsePositiveInteger(query.limit, DEFAULT_LIMIT, "Invalid limit"),
    };
    if (this.value.limit > MAX_LIMIT)
      throw new BadRequestError(`Limit must be at most ${MAX_LIMIT}`);
  }

  getValue() {
    return this.value;
  }
}

export function parsePositiveInteger(
  value: string | undefined,
  defaultValue: number,
  errorMessage: string,
): number {
  if (value === undefined) return defaultValue;
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)))
    throw new BadRequestError(errorMessage);
  return Number(value);
}
