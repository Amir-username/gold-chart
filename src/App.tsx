import { Header } from "./components/Header";
import { PriceChart } from "./components/PriceChart";
import { CryptoCards } from "./components/CryptoCards";
import { useGoldHistory } from "./hooks/useGoldHistory";
import { useLiveGold } from "./hooks/useLiveGold";
import { useCryptoCards } from "./hooks/useCryptoCards";

export default function App() {
  const { history, err: historyErr } = useGoldHistory();
  const { live, err: liveErr } = useLiveGold();
  const { cards, err: cardsErr } = useCryptoCards();

  const err = historyErr || liveErr || cardsErr;

  return (
    <div className="app">
      <Header live={live} />
      {err && <p className="err">{err}</p>}
      {history.length > 1 && <PriceChart history={history} live={live} />}
      {cards.length > 0 && <CryptoCards cards={cards} />}
    </div>
  );
}
