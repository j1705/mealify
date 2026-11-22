import type { ReactNode } from "react";
import styles from "./Alert.module.css";
import { AlertTriangleIcon, CheckCircleIcon } from "./icons";

type AlertVariant = "error" | "warning" | "success" | "info";

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  actions?: ReactNode;
};

const icons: Record<AlertVariant, ReactNode> = {
  error: <AlertTriangleIcon size={18} />,
  warning: <AlertTriangleIcon size={18} />,
  success: <CheckCircleIcon size={18} />,
  info: <AlertTriangleIcon size={18} />,
};

export default function Alert({ variant = "info", title, children, actions }: AlertProps) {
  return (
    <div
      className={[styles.alert, styles[variant]].join(" ")}
      role={variant === "error" ? "alert" : "status"}
    >
      <span className={styles.icon}>{icons[variant]}</span>
      <div className={styles.body}>
        {title && <span className={styles.title}>{title}</span>}
        {children && <span>{children}</span>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  );
}
