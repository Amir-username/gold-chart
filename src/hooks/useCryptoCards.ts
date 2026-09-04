import { useState } from "react";
import { usePolling } from "./usePolling";
import type { Card } from "../types";

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

export function useCryptoCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [err, setErr] = useState("");

  usePolling(async (isCancelled) => {
    try {
      const res = await fetch(CARDS_URL);
      const d = await res.json();
      if (isCancelled()) return;
      const cur = d.currencies || {};
      setCards(
        CARDS.filter((sym) => cur[sym]?.IRT).map((sym) => ({
          sym,
          name: CARD_NAME[sym] || sym,
          price: Number(cur[sym].IRT.price),
          change: Number(cur[sym].IRT.change_percent_24),
        })),
      );
    } catch (e) {
      if (!isCancelled()) setErr(String(e));
    }
  }, 30000);

  return { cards, err };
}
