import { useCallback, useRef, useState, type ReactNode } from "react";
import styles from "./Toast.module.css";
import { CheckCircleIcon, AlertTriangleIcon, CloseIcon } from "./icons";
import { ToastContext, type ToastVariant } from "./toastContext";

type Toast = {
  id: number;
  variant: ToastVariant;
  message: string;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = ++idRef.current;
      setToasts((current) => [...current, { id, message, variant }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.viewport}>
        {toasts.map((toast) => (
          <div key={toast.id} className={[styles.toast, styles[toast.variant]].join(" ")}>
            <span className={styles.icon}>
              {toast.variant === "success" ? (
                <CheckCircleIcon size={18} />
              ) : (
                <AlertTriangleIcon size={18} />
              )}
            </span>
            <span className={styles.message}>{toast.message}</span>
            <button
              type="button"
              className={styles.close}
              onClick={() => removeToast(toast.id)}
              aria-label="Fechar notificação"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
