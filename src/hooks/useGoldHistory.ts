import { useEffect, useState } from "react";
import type { Point } from "../types";

const HISTORY_URL =
  "https://dashboard-api.tgju.org/v1/tv2/history?symbol=geram18&resolution=1D&from=1786697804&to=1787561804";

export function useGoldHistory() {
  const [history, setHistory] = useState<Point[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(HISTORY_URL);
        const d = await res.json();
        if (cancelled) return;
        if (d.s !== "ok") throw new Error("درخواست ناموفق بود");
        setHistory(d.t.map((t: number, i: number) => ({ t, c: d.c[i] })));
      } catch (e) {
        if (!cancelled) setErr(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { history, err };
}
