import styles from "./MealSummary.module.css";
import type { MacroTotals } from "../../utils/nutrition";
import { formatGrams, formatKcal } from "../../utils/nutrition";

type MealSummaryProps = {
  totals: MacroTotals;
  title?: string;
};

export default function MealSummary({ totals, title = "Total da refeição" }: MealSummaryProps) {
  return (
    <div className={styles.bar}>
      <div>
        <span className={styles.label}>{title}</span>
        <div className={styles.kcal}>{formatKcal(totals.calories)}</div>
      </div>
      <div className={styles.macros}>
        <div className={styles.macro}>
          <span className={styles.macroLabel}>
            <span className={`${styles.macroDot} ${styles.protein}`} />
            Proteínas
          </span>
          <span className={styles.macroValue}>{formatGrams(totals.protein)}</span>
        </div>
        <div className={styles.macro}>
          <span className={styles.macroLabel}>
            <span className={`${styles.macroDot} ${styles.carbohydrate}`} />
            Carboidratos
          </span>
          <span className={styles.macroValue}>{formatGrams(totals.carbohydrate)}</span>
        </div>
        <div className={styles.macro}>
          <span className={styles.macroLabel}>
            <span className={`${styles.macroDot} ${styles.fat}`} />
            Gorduras
          </span>
          <span className={styles.macroValue}>{formatGrams(totals.fat)}</span>
        </div>
      </div>
    </div>
  );
}
