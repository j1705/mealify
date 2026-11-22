import styles from "./MacroDonut.module.css";

export type MacroDonutSegment = {
  label: string;
  percent: number;
  color: string;
};

type MacroDonutProps = {
  segments: MacroDonutSegment[];
  centerValue: string;
  centerLabel: string;
};

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 4;

function withOffsets(segments: MacroDonutSegment[]): (MacroDonutSegment & { offset: number })[] {
  let cumulative = 0;
  return segments.map((segment) => {
    const withOffset = { ...segment, offset: (cumulative / 100) * CIRCUMFERENCE };
    cumulative += segment.percent;
    return withOffset;
  });
}

export default function MacroDonut({ segments, centerValue, centerLabel }: MacroDonutProps) {
  const positionedSegments = withOffsets(segments);

  return (
    <div className={styles.wrap}>
      <div className={styles.chart}>
        <svg
          viewBox="0 0 120 120"
          className={styles.svg}
          role="img"
          aria-label={`${centerValue} ${centerLabel}`}
        >
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="14"
          />
          {positionedSegments.map((segment) => {
            const length = (segment.percent / 100) * CIRCUMFERENCE;
            const visibleLength = Math.max(length - GAP, 0);
            return (
              <circle
                key={segment.label}
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                stroke={segment.color}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${visibleLength} ${CIRCUMFERENCE - visibleLength}`}
                strokeDashoffset={-segment.offset}
              />
            );
          })}
        </svg>
        <div className={styles.center}>
          <span className={styles.centerValue}>{centerValue}</span>
          <span className={styles.centerLabel}>{centerLabel}</span>
        </div>
      </div>

      <div className={styles.legend}>
        {segments.map((segment) => (
          <div className={styles.legendRow} key={segment.label}>
            <span className={styles.legendLabel}>
              <span className={styles.legendDot} style={{ background: segment.color }} />
              {segment.label}
            </span>
            <span className={styles.legendPercent}>{segment.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
