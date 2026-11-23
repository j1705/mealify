import type { ReactNode } from "react";
import Alert from "../ui/Alert";
import Card from "../ui/Card";
import { UtensilsSmallIcon } from "../ui/icons";
import styles from "./AuthLayout.module.css";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  errorTitle: string;
  error: string | null;
  footer: ReactNode;
  children: ReactNode;
};

export default function AuthLayout({
  title,
  subtitle,
  errorTitle,
  error,
  footer,
  children,
}: AuthLayoutProps) {
  return (
    <main className={styles.page}>
      <div className={styles.column}>
        <div className={styles.brand}>
          <span className={styles.logoMark}>
            <UtensilsSmallIcon size={20} />
          </span>
          <span className={styles.brandName}>Mealify</span>
        </div>

        <Card className={styles.card}>
          <div className={styles.heading}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>

          {error && (
            <Alert variant="error" title={errorTitle}>
              {error}
            </Alert>
          )}

          {children}
        </Card>

        <p className={styles.footer}>{footer}</p>
      </div>
    </main>
  );
}
