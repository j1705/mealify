import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useAsync } from "../../src/hooks/useAsync";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useAsync", () => {
  test("starts loading and then exposes the data", async () => {
    const load = () => Promise.resolve("rice");

    const { result } = renderHook(() => useAsync(load));

    expect(result.current).toMatchObject({ loading: true, data: undefined, error: null });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({ data: "rice", error: null });
  });

  test("exposes the message of a failed load", async () => {
    const load = () => Promise.reject(new Error("Refeição não encontrada."));

    const { result } = renderHook(() => useAsync(load));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({ data: undefined, error: "Refeição não encontrada." });
  });

  test("uses a generic message when the failure is not an Error", async () => {
    const load = () => Promise.reject("boom");

    const { result } = renderHook(() => useAsync(load));

    await waitFor(() => expect(result.current.error).toBe("Erro inesperado"));
  });

  test("ignores the late answer of a previous load and aborts it", async () => {
    const slow = deferred<string>();
    const signals: AbortSignal[] = [];
    const loadFirst = (signal: AbortSignal) => {
      signals.push(signal);
      return slow.promise;
    };
    const loadSecond = () => Promise.resolve("second");

    const { result, rerender } = renderHook(({ load }) => useAsync(load), {
      initialProps: { load: loadFirst as (signal: AbortSignal) => Promise<string> },
    });
    rerender({ load: loadSecond });
    await waitFor(() => expect(result.current.data).toBe("second"));
    await act(async () => slow.resolve("first"));

    expect(signals[0]?.aborted).toBe(true);
    expect(result.current.data).toBe("second");
  });

  test("forgets the previous data while a different load runs", async () => {
    const pending = deferred<string>();
    const { result, rerender } = renderHook(({ load }) => useAsync(load), {
      initialProps: { load: () => Promise.resolve("meal 1") },
    });
    await waitFor(() => expect(result.current.data).toBe("meal 1"));

    rerender({ load: () => pending.promise });

    expect(result.current).toMatchObject({ loading: true, data: undefined });
  });

  test("aborts the running load on unmount", () => {
    let received: AbortSignal | undefined;
    const load = (signal: AbortSignal) => {
      received = signal;
      return new Promise<string>(() => {});
    };

    const { unmount } = renderHook(() => useAsync(load));
    unmount();

    expect(received?.aborted).toBe(true);
  });

  test("reloads keeping the previous data until the new answer arrives", async () => {
    const answers = ["first", "second"];
    const pending = deferred<string>();
    const load = vi
      .fn<(signal: AbortSignal) => Promise<string>>()
      .mockResolvedValueOnce(answers[0]!)
      .mockReturnValueOnce(pending.promise);

    const { result } = renderHook(() => useAsync(load));
    await waitFor(() => expect(result.current.data).toBe("first"));

    act(() => result.current.reload());

    expect(result.current).toMatchObject({ loading: true, data: "first" });
    await act(async () => pending.resolve(answers[1]!));
    expect(result.current).toMatchObject({ loading: false, data: "second" });
    expect(load).toHaveBeenCalledTimes(2);
  });

  test("clears a previous error when a reload succeeds", async () => {
    const load = vi
      .fn<(signal: AbortSignal) => Promise<string>>()
      .mockRejectedValueOnce(new Error("Falhou"))
      .mockResolvedValueOnce("ok");

    const { result } = renderHook(() => useAsync(load));
    await waitFor(() => expect(result.current.error).toBe("Falhou"));

    act(() => result.current.reload());

    await waitFor(() => expect(result.current).toMatchObject({ data: "ok", error: null }));
  });
});
