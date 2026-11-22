import type { TextareaHTMLAttributes } from "react";
import styles from "./Field.module.css";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export default function Textarea({ invalid, className, ...rest }: TextareaProps) {
  const classes = [styles.control, styles.multiline, invalid ? styles.invalid : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return <textarea className={classes} {...rest} />;
}
