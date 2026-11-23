import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../domain/error/DomainError";
import BadRequestError from "./BadRequestError";

export const INTERNAL_SERVER_ERROR = 500;

type ErrorClass = abstract new (...args: never[]) => Error;

const STATUS_BY_ERROR: [ErrorClass, number][] = [
  [BadRequestError, 400],
  [UnauthorizedError, 401],
  [NotFoundError, 404],
  [ConflictError, 409],
  [ValidationError, 422],
];

export function httpStatusFor(error: unknown): number {
  const match = STATUS_BY_ERROR.find(([errorClass]) => error instanceof errorClass);
  return match?.[1] ?? INTERNAL_SERVER_ERROR;
}
