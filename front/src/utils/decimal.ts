export const DECIMAL_MAX_INTEGER_DIGITS = 5;
export const DECIMAL_MAX_FRACTION_DIGITS = 2;

const INTEGER = `\\d{1,${DECIMAL_MAX_INTEGER_DIGITS}}`;
const DECIMAL_SEPARATOR = "[.,]";

const DECIMAL_DRAFT_PATTERN = new RegExp(
  `^(${INTEGER}(${DECIMAL_SEPARATOR}\\d{0,${DECIMAL_MAX_FRACTION_DIGITS}})?)?$`,
);
const DECIMAL_PATTERN = new RegExp(
  `^${INTEGER}(${DECIMAL_SEPARATOR}\\d{1,${DECIMAL_MAX_FRACTION_DIGITS}})?$`,
);

const FRACTION_SCALE = 10 ** DECIMAL_MAX_FRACTION_DIGITS;

export function isDecimalDraft(text: string): boolean {
  return DECIMAL_DRAFT_PATTERN.test(text);
}

export function isDecimal(text: string): boolean {
  return DECIMAL_PATTERN.test(text);
}

export function parseDecimal(text: string): number | null {
  if (!isDecimal(text)) return null;
  return Number(text.replace(",", "."));
}

export function formatDecimal(value: number): string {
  return String(Math.round(value * FRACTION_SCALE) / FRACTION_SCALE);
}
