import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceDot,
  Tooltip,
} from "recharts";

const HISTORY_URL =
  "https://dashboard-api.tgju.org/v1/tv2/history?symbol=geram18&resolution=1D&from=1786697804&to=1787561804";
const LIVE_URL =
  "https://call2.tgju.org/ajax.json?rev=tFAfBLIq65ZUMf7WdWWCACrFqYUlelxxuKP47q3oF7A1cbn8dSh9wfuaZ0P4";
const CARDS_URL =
  "https://api-web.tabdeal.org/r/plots/currencies/dynamic-info/";

const CARDS = [
  "BTC",
  "ETH",
  "USDT",
  "PAXG",
  "TRX",
  "LTC",
  "BCH",
  "ETC",
  "BNB",
  "XLM",
  "XRP",
  "DOGE",
] as const;
const CARD_NAME: Record<string, string> = {
  BTC: "بیت‌کوین",
  ETH: "اتریوم",
  USDT: "تتر",
  PAXG: "پکس گلد",
  TRX: "ترون",
  LTC: "لایت‌کوین",
  BCH: "بیت‌کوین کش",
  ETC: "اتریوم کلاسیک",
  BNB: "بایننس",
  XLM: "استلار",
  XRP: "ریپل",
  DOGE: "دوج‌کوین",
};

type Point = { t: number; c: number };
type Live = { p: number; ts: number; dt: string; dp: number };
type Card = { sym: string; name: string; price: number; change: number };

const toNum = (s: string | number) =>
  typeof s === "number" ? s : Number(String(s).replace(/,/g, ""));
const fa = (n: number) => n.toLocaleString("fa-IR");

export default function App() {
  const [history, setHistory] = useState<Point[]>([]);
  const [live, setLive] = useState<Live | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(HISTORY_URL)
      .then((r) => r.json())
      .then((d) => {
        if (d.s !== "ok") throw new Error("درخواست ناموفق بود");
        setHistory(d.t.map((t: number, i: number) => ({ t, c: d.c[i] })));
      })
      .catch((e) => setErr(String(e)));
  }, []);

  useEffect(() => {
    const tick = () =>
      fetch(LIVE_URL)
        .then((r) => r.json())
        .then((d) => {
          const g = d.current?.geram18;
          if (!g) return;
          setLive({
            p: toNum(g.p),
            ts: Math.floor(new Date(g.ts.replace(" ", "T")).getTime() / 1000),
            dt: g.dt,
            dp: g.dp,
          });
        })
        .catch((e) => setErr(String(e)));
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const tick = () =>
      fetch(CARDS_URL)
        .then((r) => r.json())
        .then((d) => {
          const cur = d.currencies || {};
          setCards(
            CARDS.filter((sym) => cur[sym]?.IRT).map((sym) => ({
              sym,
              name: CARD_NAME[sym] || sym,
              price: Number(cur[sym].IRT.price),
              change: Number(cur[sym].IRT.change_percent_24),
            })),
          );
        })
        .catch((e) => setErr(String(e)));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const merged: Point[] =
    live && history.length
      ? live.ts > history[history.length - 1].t
        ? [...history, { t: live.ts, c: live.p }]
        : history.map((p, i) =>
            i === history.length - 1 ? { ...p, c: live.p } : p,
          )
      : history;

  const up = live?.dt === "high";
  const cMin = merged.length ? Math.min(...merged.map((p) => p.c)) : 0;
  const cMax = merged.length ? Math.max(...merged.map((p) => p.c)) : 0;
  const last = merged.length ? merged[merged.length - 1] : null;

  return (
    <div className="app">
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

      {err && <p className="err">{err}</p>}

      {merged.length > 1 && last && (
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart
              data={merged}
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
                labelFormatter={(v) =>
                  new Date(Number(v) * 1000).toLocaleDateString("fa-IR")
                }
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
      )}

      {cards.length > 0 && (
        <>
          <div className="section-title">قیمت ارزهای دیجیتال</div>
          <div className="cards">
            {cards.map((c) => {
              const u = c.change >= 0;
              return (
                <div className="card" key={c.sym}>
                  <div className="card-top">
                    <div className="card-sym-wrap">
                      <div className="card-badge">{c.sym.slice(0, 2)}</div>
                      <span className="card-sym">{c.sym}</span>
                    </div>
                    <span className={u ? "up" : "down"}>
                      {u ? "▲" : "▼"} {fa(Math.abs(c.change))}٪
                    </span>
                  </div>
                  <div className="card-name">{c.name}</div>
                  <div className="card-price">
                    {fa(c.price)} <span className="u">تومان</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
