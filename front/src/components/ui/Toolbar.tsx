import type { ReactNode } from "react";
import styles from "./Toolbar.module.css";
import SearchInput from "./SearchInput";

type ToolbarProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchMaxLength?: number;
  children?: ReactNode;
  actions?: ReactNode;
};

export default function Toolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchMaxLength,
  children,
  actions,
}: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      {onSearchChange && (
        <SearchInput
          className={styles.search}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder ?? "Buscar..."}
          maxLength={searchMaxLength}
        />
      )}
      {children && <div className={styles.filters}>{children}</div>}
      {actions}
    </div>
  );
}
