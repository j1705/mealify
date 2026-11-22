import BadRequestError from "./BadRequestError";
import { isResourceId } from "./resourceId";

const DECIMAL_DIGITS = /^\d+$/;

export default class HandleId {
  private value: number;

  constructor(id: string | undefined) {
    if (id === undefined || !DECIMAL_DIGITS.test(id) || !isResourceId(Number(id)))
      throw new BadRequestError("Id invalid");
    this.value = Number(id);
  }

  getValue() {
    return this.value;
  }
}
