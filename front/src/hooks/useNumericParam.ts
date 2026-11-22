import { useParams } from "react-router-dom";

const POSITIVE_INTEGER = /^[1-9]\d*$/;

export function useNumericParam(name: string): number | null {
  const value = useParams()[name];
  if (value === undefined || !POSITIVE_INTEGER.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}
