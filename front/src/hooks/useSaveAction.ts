import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/toastContext";

type SaveActionOptions = {
  save: () => Promise<void>;
  successMessage: string;
  redirectTo: string;
};

const UNEXPECTED_ERROR = "Erro inesperado";

export function useSaveAction({ save, successMessage, redirectTo }: SaveActionOptions) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await save();
      showToast(successMessage);
      navigate(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : UNEXPECTED_ERROR);
    } finally {
      setSaving(false);
    }
  }

  return { saving, error, submit };
}
