import { useEffect, useRef } from "react";

type Tick = (isCancelled: () => boolean) => Promise<void>;

export function usePolling(tick: Tick, intervalMs: number) {
  const tickRef = useRef(tick);
  useEffect(() => {
    tickRef.current = tick;
  });

  useEffect(() => {
    let cancelled = false;
    const run = () => void tickRef.current(() => cancelled);
    run();
    const id = setInterval(run, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);
}
