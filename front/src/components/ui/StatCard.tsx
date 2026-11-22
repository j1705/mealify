import type { ReactNode } from "react";
import styles from "./StatCard.module.css";

type StatCardProps = {
  icon: ReactNode;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  unit?: string;
  hint?: string;
};

export default function StatCard({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  unit,
  hint,
}: StatCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.iconWrap} style={{ background: iconBg, color: iconColor }}>
        {icon}
      </span>
      <div className={styles.body}>
        <span className={styles.label}>{label}</span>
        <span className={styles.valueRow}>
          <span className={styles.value}>{value}</span>
          {unit && <span className={styles.unit}>{unit}</span>}
        </span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
    </div>
  );
}
