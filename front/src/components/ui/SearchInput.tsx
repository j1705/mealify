import type { InputHTMLAttributes } from "react";
import Input from "./Input";
import { SearchIcon } from "./icons";
import styles from "./SearchInput.module.css";

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  className?: string;
};

export default function SearchInput({ className, ...inputProps }: SearchInputProps) {
  return (
    <div className={[styles.wrap, className ?? ""].join(" ")}>
      <span className={styles.icon} aria-hidden="true">
        <SearchIcon size={16} />
      </span>
      <Input className={styles.input} {...inputProps} />
    </div>
  );
}
