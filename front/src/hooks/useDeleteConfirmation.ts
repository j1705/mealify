import { useState } from "react";
import { useToast } from "../components/ui/toastContext";

type DeleteConfirmationOptions<T> = {
  remove: (target: T) => Promise<void>;
  successMessage: string;
  fallbackErrorMessage: string;
  onDeleted: (target: T) => void;
};

export function useDeleteConfirmation<T>({
  remove,
  successMessage,
  fallbackErrorMessage,
  onDeleted,
}: DeleteConfirmationOptions<T>) {
  const { showToast } = useToast();
  const [target, setTarget] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirm() {
    if (target === null) return;
    setDeleting(true);
    try {
      await remove(target);
      showToast(successMessage);
      setTarget(null);
      onDeleted(target);
    } catch (err) {
      showToast(err instanceof Error ? err.message : fallbackErrorMessage, "error");
    } finally {
      setDeleting(false);
    }
  }

  return {
    target,
    deleting,
    ask: setTarget,
    cancel: () => setTarget(null),
    confirm,
  };
}
