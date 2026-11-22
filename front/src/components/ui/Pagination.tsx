import styles from "./Pagination.module.css";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

type PaginationProps = {
  page: number;
  pageCount: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  page,
  pageCount,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className={styles.wrap}>
      <span className={styles.summary}>
        Mostrando {from}–{to} de {totalItems}
      </span>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.pageButton}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeftIcon size={16} />
        </button>
        <span className={styles.current}>{page}</span>
        <button
          type="button"
          className={styles.pageButton}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Próxima página"
        >
          <ChevronRightIcon size={16} />
        </button>
      </div>
    </div>
  );
}
