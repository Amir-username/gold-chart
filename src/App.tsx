import { useMemo } from "react";
import { Header } from "./components/Header";
import { PriceChart } from "./components/PriceChart";
import { CryptoCards } from "./components/CryptoCards";
import { useGoldHistory } from "./hooks/useGoldHistory";
import { useLiveGold } from "./hooks/useLiveGold";
import { useCryptoCards } from "./hooks/useCryptoCards";
import { mergeLiveIntoHistory } from "./utils";

export default function App() {
  const { history, err: historyErr } = useGoldHistory();
  const { live, err: liveErr } = useLiveGold();
  const { cards, err: cardsErr } = useCryptoCards();

  const data = useMemo(
    () => mergeLiveIntoHistory(history, live),
    [history, live],
  );
  const err = historyErr || liveErr || cardsErr;

  return (
    <div className="app">
      <Header live={live} />
      {err && <p className="err">{err}</p>}
      {data.length > 1 && <PriceChart data={data} live={live} />}
      {cards.length > 0 && <CryptoCards cards={cards} />}
    </div>
  );
}
