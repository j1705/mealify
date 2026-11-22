import BadRequestError from "./BadRequestError";
import Name from "../../domain/vo/Name";

export const MAX_SEARCH_LENGTH = Name.MAX_LENGTH;

export default class HandleSearch {
  private value: string | undefined;

  constructor(search: string | undefined) {
    const term = search?.trim();
    if (term && term.length > MAX_SEARCH_LENGTH)
      throw new BadRequestError(`Search must be at most ${MAX_SEARCH_LENGTH} characters`);
    this.value = term || undefined;
  }

  getValue() {
    return this.value;
  }
}
