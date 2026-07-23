"use client";

import { formatIDR, formatCurrency } from "@/lib/currency";

export function MoneyIDR({ amount }: { amount: number }) {
  return <span className="font-medium">{formatIDR(amount)}</span>;
}

export function MoneyForeign({
  amount,
  currency,
}: {
  amount: number;
  currency: string;
}) {
  if (currency === "IDR") return <MoneyIDR amount={amount} />;
  return (
    <span className="text-muted">
      {formatCurrency(amount, currency)}
    </span>
  );
}
