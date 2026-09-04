import { usePriceChart } from "../hooks/usePriceChart";
import { fa } from "../utils";
import type { Live, Point } from "../types";

export function PriceChart({
  history,
  live,
}: {
  history: Point[];
  live: Live | null;
}) {
  const { containerRef, min, max } = usePriceChart(history, live);

  return (
    <div className="chart-card">
      <div ref={containerRef} style={{ width: "100%", height: 360 }} />
      <div className="meta">
        <span>
          کمینه: <b>{fa(min)}</b> تومان
        </span>
        <span>
          بیشینه: <b>{fa(max)}</b> تومان
        </span>
      </div>
    </div>
  );
}
