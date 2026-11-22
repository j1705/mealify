import { useCallback } from "react";
import { getMeal } from "../services/mealService";
import { useAsync } from "./useAsync";

const MEAL_NOT_FOUND = "Refeição não encontrada.";

export function useMeal(mealId: number | null) {
  const load = useCallback(
    (signal: AbortSignal) =>
      mealId === null ? Promise.reject(new Error(MEAL_NOT_FOUND)) : getMeal(mealId, signal),
    [mealId],
  );
  return useAsync(load);
}
