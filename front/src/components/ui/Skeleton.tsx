import styles from "./Skeleton.module.css";

type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  radius?: string;
  className?: string;
};

export function Skeleton({ width = "100%", height = 14, radius, className }: SkeletonProps) {
  return (
    <span
      className={[styles.skeleton, className ?? ""].join(" ")}
      style={{ width, height, borderRadius: radius }}
      data-skeleton
    />
  );
}

type SkeletonRowsProps = {
  rows: number;
  height: number;
  padded?: boolean;
};

export function SkeletonRows({ rows, height, padded = false }: SkeletonRowsProps) {
  return (
    <div className={[styles.rows, padded ? styles.padded : ""].join(" ")}>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} height={height} />
      ))}
    </div>
  );
}

type SpinnerProps = {
  size?: number;
};

export function Spinner({ size = 20 }: SpinnerProps) {
  return (
    <span
      className={styles.spinner}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Carregando"
    />
  );
}
