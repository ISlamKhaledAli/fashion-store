import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Conversion rate relative to USD (1 USD = X Currency)
  flag: string;
  decimals: number;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: "USD",
    name: "United States",
    symbol: "$",
    rate: 1.0,
    flag: "🇺🇸",
    decimals: 2,
  },
  EUR: {
    code: "EUR",
    name: "France & EU",
    symbol: "€",
    rate: 0.92,
    flag: "🇪🇺",
    decimals: 2,
  },
  GBP: {
    code: "GBP",
    name: "United Kingdom",
    symbol: "£",
    rate: 0.79,
    flag: "🇬🇧",
    decimals: 2,
  },
  SAR: {
    code: "SAR",
    name: "Saudi Arabia",
    symbol: "SAR",
    rate: 3.75,
    flag: "🇸🇦",
    decimals: 0,
  },
  AED: {
    code: "AED",
    name: "United Arab Emirates",
    symbol: "AED",
    rate: 3.67,
    flag: "🇦🇪",
    decimals: 0,
  },
  EGP: {
    code: "EGP",
    name: "Egypt",
    symbol: "E£",
    rate: 48.5,
    flag: "🇪🇬",
    decimals: 0,
  },
  JPY: {
    code: "JPY",
    name: "Japan",
    symbol: "¥",
    rate: 155.0,
    flag: "🇯🇵",
    decimals: 0,
  },
};

interface CurrencyState {
  currentCurrency: CurrencyConfig;
  setCurrency: (code: string) => void;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currentCurrency: CURRENCIES.USD,
      setCurrency: (code: string) => {
        const selected = CURRENCIES[code] || CURRENCIES.USD;
        set({ currentCurrency: selected });
      },
      convertPrice: (amountInUSD: number) => {
        const { rate } = get().currentCurrency;
        return Number(amountInUSD) * rate;
      },
      formatPrice: (amountInUSD: number) => {
        const { currentCurrency } = get();
        const converted = Number(amountInUSD) * currentCurrency.rate;

        try {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currentCurrency.code,
            minimumFractionDigits: currentCurrency.decimals,
            maximumFractionDigits: currentCurrency.decimals,
          }).format(converted);
        } catch {
          return `${currentCurrency.symbol}${converted.toFixed(currentCurrency.decimals)}`;
        }
      },
    }),
    {
      name: "thecurator_currency",
      partialize: (state) => ({ currentCurrency: state.currentCurrency }),
    }
  )
);
