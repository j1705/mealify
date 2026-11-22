import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./PageHeader.module.css";
import { ArrowLeftIcon } from "./icons";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backTo?: string;
  backLabel?: string;
};

export default function PageHeader({
  title,
  subtitle,
  actions,
  backTo,
  backLabel = "Voltar",
}: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.titleGroup}>
        {backTo && (
          <Link to={backTo} className={styles.back}>
            <ArrowLeftIcon size={16} />
            {backLabel}
          </Link>
        )}
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
