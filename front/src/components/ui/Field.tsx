import type { ReactNode } from "react";
import styles from "./Field.module.css";
import { AlertTriangleIcon } from "./icons";

type FieldProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export default function Field({ label, htmlFor, required, hint, error, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
        {hint && !error && <span className={styles.hint}>{hint}</span>}
      </div>
      {children}
      {error && (
        <span className={styles.error} role="alert">
          <AlertTriangleIcon size={13} />
          {error}
        </span>
      )}
    </div>
  );
}
