import { fa, isUp } from "../utils";
import type { Live } from "../types";

export function Header({ live }: { live: Live | null }) {
  const up = isUp(live);
  return (
    <header>
      <div className="brand">
        <div className="brand-mark">Au</div>
        <h1>نرخ طلا — گرم ۱۸</h1>
      </div>
      {live && (
        <div className="live">
          <span className="price">{fa(live.p)}</span>
          <span className="unit">تومان</span>
          <span className={up ? "up" : "down"}>
            {up ? "▲" : "▼"} {fa(live.dp)}٪
          </span>
        </div>
      )}
    </header>
  );
}
