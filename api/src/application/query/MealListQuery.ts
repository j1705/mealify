import { PaginationInput } from "./PaginationQuery";

export type MealListQuery = PaginationInput & {
  search?: string | undefined;
  date?: string | undefined;
};
