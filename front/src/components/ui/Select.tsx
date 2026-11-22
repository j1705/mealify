import type { SelectHTMLAttributes } from "react";
import styles from "./Field.module.css";
import { ChevronDownIcon } from "./icons";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export default function Select({ invalid, className, children, ...rest }: SelectProps) {
  const classes = [styles.control, styles.select, invalid ? styles.invalid : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.selectWrap}>
      <select className={classes} {...rest}>
        {children}
      </select>
      <span className={styles.selectChevron}>
        <ChevronDownIcon size={16} />
      </span>
    </div>
  );
}
