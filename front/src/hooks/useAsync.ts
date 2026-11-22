import { useCallback, useEffect, useState } from "react";

export type AsyncLoader<T> = (signal: AbortSignal) => Promise<T>;

type Answer<T> = {
  load: AsyncLoader<T>;
  round: number;
  data: T | undefined;
  error: string | null;
};

const UNEXPECTED_ERROR = "Erro inesperado";

export function useAsync<T>(load: AsyncLoader<T>) {
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState<Answer<T> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setAnswer({ load, round, data, error: null });
      },
      (err: unknown) => {
        if (controller.signal.aborted) return;
        const error = err instanceof Error ? err.message : UNEXPECTED_ERROR;
        setAnswer({ load, round, data: undefined, error });
      },
    );
    return () => controller.abort();
  }, [load, round]);

  const reload = useCallback(() => setRound((current) => current + 1), []);

  const answersThisLoad = answer?.load === load;
  const answersThisRound = answersThisLoad && answer.round === round;

  return {
    data: answersThisLoad ? answer.data : undefined,
    loading: !answersThisRound,
    error: answersThisRound ? answer.error : null,
    reload,
  };
}
