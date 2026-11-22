import { useCallback, useEffect, useMemo, useState } from "react";
import type { Paginated } from "../types/Pagination";
import { useDebouncedValue } from "./useDebouncedValue";

const SEARCH_DEBOUNCE_MS = 300;
const UNEXPECTED_ERROR = "Erro inesperado";

export type PageQuery = { search: string; page: number; limit: number };

export type PageFetcher<T> = (query: PageQuery, signal: AbortSignal) => Promise<Paginated<T>>;

type Request<T> = { fetchPage: PageFetcher<T>; query: PageQuery; round: number };

type PageState<T> = {
  request: Request<T> | null;
  items: T[];
  total: number;
  totalPages: number;
  error: string | null;
};

export function usePagedSearch<T>(fetchPage: PageFetcher<T>, { search, page, limit }: PageQuery) {
  const term = search.trim();
  const debouncedTerm = useDebouncedValue(term, SEARCH_DEBOUNCE_MS);
  const [round, setRound] = useState(0);
  const [state, setState] = useState<PageState<T>>({
    request: null,
    items: [],
    total: 0,
    totalPages: 0,
    error: null,
  });

  const request = useMemo<Request<T>>(
    () => ({ fetchPage, query: { search: debouncedTerm, page, limit }, round }),
    [fetchPage, debouncedTerm, page, limit, round],
  );

  useEffect(() => {
    const controller = new AbortController();
    request.fetchPage(request.query, controller.signal).then(
      ({ data, pagination }) => {
        if (controller.signal.aborted) return;
        const { total, totalPages } = pagination;
        setState({ request, items: data, total, totalPages, error: null });
      },
      (err: unknown) => {
        if (controller.signal.aborted) return;
        const error = err instanceof Error ? err.message : UNEXPECTED_ERROR;
        setState((current) => ({ ...current, request, error }));
      },
    );
    return () => controller.abort();
  }, [request]);

  const reload = useCallback(() => setRound((current) => current + 1), []);

  return {
    items: state.items,
    total: state.total,
    totalPages: state.totalPages,
    searchedTerm: state.request?.query.search ?? null,
    loading: term !== debouncedTerm || state.request !== request,
    error: state.request === request ? state.error : null,
    reload,
  };
}
