import { fa } from "../utils";
import type { Card } from "../types";

function CryptoCard({ card }: { card: Card }) {
  const u = card.change >= 0;
  return (
    <div className="card">
      <div className="card-top">
        <div className="card-sym-wrap">
          <div className="card-badge">{card.sym.slice(0, 2)}</div>
          <span className="card-sym">{card.sym}</span>
        </div>
        <span className={u ? "up" : "down"}>
          {u ? "▲" : "▼"} {fa(Math.abs(card.change))}٪
        </span>
      </div>
      <div className="card-name">{card.name}</div>
      <div className="card-price">
        {fa(card.price)} <span className="u">تومان</span>
      </div>
    </div>
  );
}

export function CryptoCards({ cards }: { cards: Card[] }) {
  return (
    <>
      <div className="section-title">قیمت ارزهای دیجیتال</div>
      <div className="cards">
        {cards.map((c) => (
          <CryptoCard key={c.sym} card={c} />
        ))}
      </div>
    </>
  );
}
