import { act, renderHook, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useSaveAction } from "../../src/hooks/useSaveAction";
import { formRouteWrapper } from "../formRouteWrapper";

function setup(save: () => Promise<void>) {
  return renderHook(
    () => useSaveAction({ save, successMessage: "Refeição criada!", redirectTo: "/meals" }),
    { wrapper: formRouteWrapper },
  );
}

describe("useSaveAction", () => {
  test("saves, confirms with a toast and goes to the given page", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const { result } = setup(save);

    await act(() => result.current.submit());

    expect(save).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Refeição criada!")).toBeInTheDocument();
    expect(screen.getByText("Meals list")).toBeInTheDocument();
  });

  test("marks itself as saving while the save runs", async () => {
    let finish!: () => void;
    const save = () => new Promise<void>((resolve) => (finish = resolve));
    const { result } = setup(save);

    let submitting!: Promise<void>;
    act(() => {
      submitting = result.current.submit();
    });

    expect(result.current.saving).toBe(true);
    await act(async () => {
      finish();
      await submitting;
    });
  });

  test("keeps the page and exposes the error message when the save fails", async () => {
    const save = vi.fn().mockRejectedValue(new Error("Já existe um item com esse nome."));
    const { result } = setup(save);

    await act(() => result.current.submit());

    expect(result.current).toMatchObject({
      saving: false,
      error: "Já existe um item com esse nome.",
    });
    expect(screen.queryByText("Meals list")).not.toBeInTheDocument();
  });

  test("clears the previous error on a new attempt", async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error("Falhou"))
      .mockImplementationOnce(() => new Promise<void>(() => {}));
    const { result } = setup(save);
    await act(() => result.current.submit());

    act(() => {
      void result.current.submit();
    });

    expect(result.current.error).toBeNull();
  });
});
