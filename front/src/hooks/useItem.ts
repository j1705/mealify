import { useCallback } from "react";
import { getItem } from "../services/itemService";
import { useAsync } from "./useAsync";

const ITEM_NOT_FOUND = "Item não encontrado.";

export function useItem(itemId: number | null) {
  const load = useCallback(
    (signal: AbortSignal) =>
      itemId === null ? Promise.reject(new Error(ITEM_NOT_FOUND)) : getItem(itemId, signal),
    [itemId],
  );
  return useAsync(load);
}
