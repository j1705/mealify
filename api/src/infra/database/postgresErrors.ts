const FOREIGN_KEY_VIOLATION = "23503";
const UNIQUE_VIOLATION = "23505";

function hasPostgresCode(error: unknown, code: string): boolean {
  return (error as { code?: unknown } | null)?.code === code;
}

export function isForeignKeyViolation(error: unknown): boolean {
  return hasPostgresCode(error, FOREIGN_KEY_VIOLATION);
}

export function isUniqueViolation(error: unknown): boolean {
  return hasPostgresCode(error, UNIQUE_VIOLATION);
}
