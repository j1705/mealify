import { act, renderHook, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useDeleteConfirmation } from "../../src/hooks/useDeleteConfirmation";
import { formRouteWrapper } from "../formRouteWrapper";

type Meal = { id: number; name: string };
const lunch: Meal = { id: 1, name: "Lunch" };

function setup(remove: (meal: Meal) => Promise<void>, onDeleted = vi.fn()) {
  const hook = renderHook(
    () =>
      useDeleteConfirmation<Meal>({
        remove,
        successMessage: "Refeição excluída.",
        fallbackErrorMessage: "Não foi possível excluir a refeição",
        onDeleted,
      }),
    { wrapper: formRouteWrapper },
  );
  return { ...hook, onDeleted };
}

describe("useDeleteConfirmation", () => {
  test("asks for confirmation before deleting", () => {
    const remove = vi.fn();
    const { result } = setup(remove);

    act(() => result.current.ask(lunch));

    expect(result.current.target).toBe(lunch);
    expect(remove).not.toHaveBeenCalled();
  });

  test("forgets the target when cancelled", () => {
    const { result } = setup(vi.fn());
    act(() => result.current.ask(lunch));

    act(() => result.current.cancel());

    expect(result.current.target).toBeNull();
  });

  test("deletes the confirmed target, toasts and reports it", async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    const { result, onDeleted } = setup(remove);
    act(() => result.current.ask(lunch));

    await act(() => result.current.confirm());

    expect(remove).toHaveBeenCalledWith(lunch);
    expect(onDeleted).toHaveBeenCalledWith(lunch);
    expect(screen.getByText("Refeição excluída.")).toBeInTheDocument();
    expect(result.current).toMatchObject({ target: null, deleting: false });
  });

  test("keeps the dialog open and toasts the error when the deletion fails", async () => {
    const remove = vi.fn().mockRejectedValue(new Error("Refeição não encontrada."));
    const { result, onDeleted } = setup(remove);
    act(() => result.current.ask(lunch));

    await act(() => result.current.confirm());

    expect(onDeleted).not.toHaveBeenCalled();
    expect(screen.getByText("Refeição não encontrada.")).toBeInTheDocument();
    expect(result.current).toMatchObject({ target: lunch, deleting: false });
  });

  test("uses the fallback message when the failure is not an Error", async () => {
    const { result } = setup(vi.fn().mockRejectedValue("boom"));
    act(() => result.current.ask(lunch));

    await act(() => result.current.confirm());

    expect(screen.getByText("Não foi possível excluir a refeição")).toBeInTheDocument();
  });

  test("does nothing when confirming without a target", async () => {
    const remove = vi.fn();
    const { result } = setup(remove);

    await act(() => result.current.confirm());

    expect(remove).not.toHaveBeenCalled();
  });
});
