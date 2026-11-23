import { useState } from "react";

const UNEXPECTED_ERROR = "Erro inesperado";

export function useAuthSubmit(action: () => Promise<void>, onSuccess: () => void) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      await action();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : UNEXPECTED_ERROR);
      setSubmitting(false);
    }
  }

  return { submitting, error, submit };
}
