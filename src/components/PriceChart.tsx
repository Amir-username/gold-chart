import {
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceDot,
  Tooltip,
} from "recharts";
import { fa, isUp } from "../utils";
import type { Live, Point } from "../types";

export function PriceChart({
  data,
  live,
}: {
  data: Point[];
  live: Live | null;
}) {
  const up = isUp(live);
  const cMin = Math.min(...data.map((p) => p.c));
  const cMax = Math.max(...data.map((p) => p.c));
  const last = data[data.length - 1];

  return (
    <div className="chart-card">
      <ResponsiveContainer width="100%" height={360}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, bottom: 0, left: 10 }}
        >
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              direction: "ltr",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 12,
              fontFamily: "inherit",
            }}
            labelFormatter={() => <div></div>}
            formatter={(v) => [`${fa(Number(v))} تومان`, "قیمت"]}
          />
          <Area
            type="monotone"
            dataKey="c"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#g)"
            isAnimationActive={false}
          />
          {live && (
            <ReferenceDot
              x={last.t}
              y={last.c}
              r={5}
              fill="#fff"
              stroke={up ? "#16a34a" : "#dc2626"}
              strokeWidth={2.5}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      <div className="meta">
        <span>
          کمینه: <b>{fa(cMin)}</b> تومان
        </span>
        <span>
          بیشینه: <b>{fa(cMax)}</b> تومان
        </span>
      </div>
    </div>
  );
}
