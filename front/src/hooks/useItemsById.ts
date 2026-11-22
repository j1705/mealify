import { useCallback, useEffect, useRef, useState } from "react";
import { getItem } from "../services/itemService";
import type { Item } from "../types/Item";

export function useItemsById(itemIds: number[]) {
  const [itemsById, setItemsById] = useState<Map<number, Item>>(() => new Map());
  const [missingIds, setMissingIds] = useState<Set<number>>(() => new Set());
  const requested = useRef(new Set<number>());

  const remember = useCallback((item: Item) => {
    requested.current.add(item.id);
    setItemsById((current) => new Map(current).set(item.id, item));
  }, []);

  useEffect(() => {
    for (const itemId of itemIds) {
      if (requested.current.has(itemId)) continue;
      requested.current.add(itemId);
      getItem(itemId).then(
        (item) => setItemsById((current) => new Map(current).set(itemId, item)),
        () => setMissingIds((current) => new Set(current).add(itemId)),
      );
    }
  }, [itemIds]);

  return { itemsById, missingIds, remember };
}
