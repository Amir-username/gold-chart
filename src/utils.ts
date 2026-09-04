import type { Live, Point } from "./types";

export const toNum = (s: string | number) =>
  typeof s === "number" ? s : Number(String(s).replace(/,/g, ""));

export const fa = (n: number) => n.toLocaleString("fa-IR");

export const isUp = (live: Live | null) => live?.dt === "high";

export function mergeLiveIntoHistory(
  history: Point[],
  live: Live | null,
): Point[] {
  if (!live || history.length === 0) return history;
  const last = history[history.length - 1];
  if (live.ts > last.t) return [...history, { t: live.ts, c: live.p }];
  return history.map((p, i) =>
    i === history.length - 1 ? { ...p, c: live.p } : p,
  );
}
