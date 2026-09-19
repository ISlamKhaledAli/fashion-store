import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useCurrencyStore } from "@/store/currencyStore";

export function formatCurrency(amount: number) {
  try {
    return useCurrencyStore.getState().formatPrice(amount);
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
}

export function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

export function getApiUrl(path: string): string {
  if (typeof window === "undefined") {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    return `${baseUrl}${path}`;
  }
  return `/api${path}`;
}
