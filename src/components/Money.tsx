"use client";

import { formatIDR, formatCurrency } from "@/lib/currency";

export function MoneyIDR({ amount }: { amount: number }) {
  return (
    <span className="font-semibold tabular-nums tracking-tight">
      {formatIDR(amount)}
    </span>
  );
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
    <span className="tabular-nums text-muted">
      {formatCurrency(amount, currency)}
    </span>
  );
}
