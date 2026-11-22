import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { usePagedSearch, type PageQuery } from "../../src/hooks/usePagedSearch";
import type { Paginated } from "../../src/types/Pagination";

function pageOf(names: string[], total = names.length): Paginated<string> {
  return { data: names, pagination: { page: 1, limit: 10, total, totalPages: 1 } };
}

async function flush() {
  await act(async () => {});
}

describe("usePagedSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("loads the first page right away and exposes it", async () => {
    const fetchPage = vi.fn().mockResolvedValue(pageOf(["Lunch"], 9));

    const { result } = renderHook(() =>
      usePagedSearch(fetchPage, { search: "", page: 1, limit: 10 }),
    );
    expect(result.current.loading).toBe(true);
    await flush();

    expect(fetchPage).toHaveBeenCalledWith(
      { search: "", page: 1, limit: 10 },
      expect.any(AbortSignal),
    );
    expect(result.current).toMatchObject({
      items: ["Lunch"],
      total: 9,
      searchedTerm: "",
      loading: false,
      error: null,
    });
  });

  test("waits for the user to stop typing before searching the trimmed term", async () => {
    const fetchPage = vi.fn().mockResolvedValue(pageOf([]));
    const { rerender, result } = renderHook(
      ({ search }) => usePagedSearch(fetchPage, { search, page: 1, limit: 10 }),
      { initialProps: { search: "" } },
    );
    await flush();

    rerender({ search: " lun " });
    expect(result.current.loading).toBe(true);
    await act(async () => vi.advanceTimersByTime(299));
    expect(fetchPage).toHaveBeenCalledTimes(1);

    await act(async () => vi.advanceTimersByTime(1));
    await flush();

    expect(fetchPage).toHaveBeenLastCalledWith(
      { search: "lun", page: 1, limit: 10 },
      expect.any(AbortSignal),
    );
    expect(result.current.searchedTerm).toBe("lun");
  });

  test("keeps showing the previous page while the next one loads", async () => {
    let resolveSecond!: (page: Paginated<string>) => void;
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(pageOf(["Lunch"]))
      .mockReturnValueOnce(new Promise((resolve) => (resolveSecond = resolve)));
    const { rerender, result } = renderHook(
      ({ page }) => usePagedSearch(fetchPage, { search: "", page, limit: 1 }),
      { initialProps: { page: 1 } },
    );
    await flush();

    rerender({ page: 2 });

    expect(result.current).toMatchObject({ loading: true, items: ["Lunch"] });
    await act(async () => resolveSecond(pageOf(["Dinner"])));
    expect(result.current).toMatchObject({ loading: false, items: ["Dinner"] });
  });

  test("aborts and ignores a request that was replaced", async () => {
    const signals: AbortSignal[] = [];
    let resolveFirst!: (page: Paginated<string>) => void;
    const fetchPage = vi.fn((_query: PageQuery, signal: AbortSignal) => {
      signals.push(signal);
      return signals.length === 1
        ? new Promise<Paginated<string>>((resolve) => (resolveFirst = resolve))
        : Promise.resolve(pageOf(["Dinner"]));
    });
    const { rerender, result } = renderHook(
      ({ page }) => usePagedSearch(fetchPage, { search: "", page, limit: 1 }),
      { initialProps: { page: 1 } },
    );

    rerender({ page: 2 });
    await flush();
    await act(async () => resolveFirst(pageOf(["Lunch"])));

    expect(signals[0]?.aborted).toBe(true);
    expect(result.current.items).toEqual(["Dinner"]);
  });

  test("exposes the error and reloads on demand", async () => {
    const fetchPage = vi
      .fn()
      .mockRejectedValueOnce(new Error("Falhou"))
      .mockResolvedValueOnce(pageOf(["Lunch"]));
    const { result } = renderHook(() =>
      usePagedSearch(fetchPage, { search: "", page: 1, limit: 10 }),
    );
    await flush();
    expect(result.current.error).toBe("Falhou");

    act(() => result.current.reload());
    await flush();

    expect(result.current).toMatchObject({ error: null, items: ["Lunch"] });
  });
});
