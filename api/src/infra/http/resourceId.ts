export const MAX_RESOURCE_ID = 2_147_483_647;

export function isResourceId(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 1 &&
    value <= MAX_RESOURCE_ID
  );
}
