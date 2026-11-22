export default class QueryParams {
  private readonly values: unknown[] = [];

  add(value: unknown): string {
    this.values.push(value);
    return `$${this.values.length}`;
  }

  getValues(): unknown[] {
    return [...this.values];
  }
}
