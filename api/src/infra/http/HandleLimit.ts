import BadRequestError from "./BadRequestError";
import { parsePositiveInteger } from "./HandlePagination";

type LimitOptions = { defaultLimit: number; maxLimit: number };

export default class HandleLimit {
  private value: number;

  constructor(limit: string | undefined, { defaultLimit, maxLimit }: LimitOptions) {
    this.value = parsePositiveInteger(limit, defaultLimit, "Invalid limit");
    if (this.value > maxLimit) throw new BadRequestError(`Limit must be at most ${maxLimit}`);
  }

  getValue() {
    return this.value;
  }
}
