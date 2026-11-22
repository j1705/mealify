import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
};

export default function Card({ padded = true, className, children, ...rest }: CardProps) {
  const classes = [styles.card, padded ? styles.padded : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

type CardHeaderProps = {
  title: ReactNode;
  action?: ReactNode;
};

export function CardHeader({ title, action }: CardHeaderProps) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      {action}
    </div>
  );
}
