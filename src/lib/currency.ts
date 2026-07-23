export const SUPPORTED_CURRENCIES = [
  "USD", "SGD", "MYR", "JPY", "THB",
  "EUR", "GBP", "AUD", "KRW", "CNY",
  "HKD", "TWD", "PHP", "VND", "AED",
  "SAR", "QAR", "KWD", "BND",
];

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
