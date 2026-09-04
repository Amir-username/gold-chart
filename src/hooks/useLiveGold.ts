import { useState } from "react";
import { usePolling } from "./usePolling";
import { toNum } from "../utils";
import type { Live } from "../types";

const LIVE_URL =
  "https://call2.tgju.org/ajax.json?rev=tFAfBLIq65ZUMf7WdWWCACrFqYUlelxxuKP47q3oF7A1cbn8dSh9wfuaZ0P4";

export function useLiveGold() {
  const [live, setLive] = useState<Live | null>(null);
  const [err, setErr] = useState("");

  usePolling(async (isCancelled) => {
    try {
      const res = await fetch(LIVE_URL);
      const d = await res.json();
      if (isCancelled()) return;
      const g = d.current?.geram18;
      if (!g) return;
      setLive({
        p: toNum(g.p),
        ts: Math.floor(new Date(g.ts.replace(" ", "T")).getTime() / 1000),
        dt: g.dt,
        dp: g.dp,
      });
    } catch (e) {
      if (!isCancelled()) setErr(String(e));
    }
  }, 5000);

  return { live, err };
}
