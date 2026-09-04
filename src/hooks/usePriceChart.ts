import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  AreaSeries,
  ColorType,
  createChart,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Live, Point } from "../types";
import { isUp, mergeLiveIntoHistory } from "../utils";

const UP = "#16a34a";
const DOWN = "#dc2626";

const toChartPoint = (p: Point) => ({ time: p.t as UTCTimestamp, value: p.c });

export function usePriceChart(history: Point[], live: Live | null) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const markersRef = useRef<ReturnType<typeof createSeriesMarkers> | null>(
    null,
  );
  const lastTimeRef = useRef(0);

  // keep latest live tick reachable from the history effect
  const liveRef = useRef(live);
  useEffect(() => {
    liveRef.current = live;
  });

  // create chart + series once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      autoSize: true, // replaces ResponsiveContainer
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#64748b",
        fontFamily: "inherit",
      },
      grid: {
        vertLines: { color: "#f1f5f9" },
        horzLines: { color: "#f1f5f9" },
      },
      rightPriceScale: { borderColor: "#e2e8f0" },
      timeScale: {
        borderColor: "#e2e8f0",
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (t) =>
          new Date(Number(t) * 1000).toLocaleDateString("fa-IR"),
      },
      localization: {
        locale: "fa-IR",
        priceFormatter: (p) => p.toLocaleString("fa-IR"),
      },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#3b82f6",
      lineWidth: 2,
      topColor: "rgba(59,130,246,0.25)",
      bottomColor: "rgba(59,130,246,0)",
      lastValueVisible: true,
      priceLineVisible: true,
    });

    markersRef.current = createSeriesMarkers(series, []);
    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      markersRef.current = null;
    };
  }, []);

  // push a live tick: new point if ts advanced, otherwise replace the last one
  const applyLive = useCallback((l: Live) => {
    const series = seriesRef.current;
    if (!series || !lastTimeRef.current) return;

    const time = Math.max(l.ts, lastTimeRef.current) as UTCTimestamp;
    series.update({ time, value: l.p });
    lastTimeRef.current = time;

    series.applyOptions({ priceLineColor: isUp(l) ? UP : DOWN });
    markersRef.current?.setMarkers([
      {
        time,
        position: "aboveBar",
        shape: "circle",
        size: 1,
        color: isUp(l) ? UP : DOWN,
      },
    ]);
  }, []);

  // history → full dataset (only when history is (re)loaded)
  useEffect(() => {
    const series = seriesRef.current;
    if (!series || history.length === 0) return;

    series.setData(history.map(toChartPoint));
    lastTimeRef.current = history[history.length - 1].t;
    chartRef.current?.timeScale().fitContent();

    // history may finish loading after a live tick already arrived
    if (liveRef.current) applyLive(liveRef.current);
  }, [history, applyLive]);

  // live → incremental updates only (no setData)
  useEffect(() => {
    if (live) applyLive(live);
  }, [live, applyLive]);

  // min/max for the meta row (merge is only needed for stats now)
  const stats = useMemo(() => {
    const merged = mergeLiveIntoHistory(history, live);
    if (merged.length === 0) return { min: 0, max: 0 };
    return {
      min: Math.min(...merged.map((p) => p.c)),
      max: Math.max(...merged.map((p) => p.c)),
    };
  }, [history, live]);

  return { containerRef, min: stats.min, max: stats.max };
}
