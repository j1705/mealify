import { PaginationInput } from "../query/PaginationQuery";

export type PaginatedOutput<T> = {
  data: T[];
  pagination: PaginationInput & {
    total: number;
    totalPages: number;
  };
};

export function toPaginatedOutput<T>(
  data: T[],
  total: number,
  { page, limit }: PaginationInput,
): PaginatedOutput<T> {
  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
