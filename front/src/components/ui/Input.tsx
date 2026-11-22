import type { InputHTMLAttributes } from "react";
import styles from "./Field.module.css";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  adornment?: string;
};

export default function Input({ invalid, adornment, className, ...rest }: InputProps) {
  const classes = [styles.control, invalid ? styles.invalid : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  if (adornment) {
    return (
      <div className={styles.withAdornment}>
        <input className={classes} {...rest} />
        <span className={styles.adornment}>{adornment}</span>
      </div>
    );
  }

  return <input className={classes} {...rest} />;
}
