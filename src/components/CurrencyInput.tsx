"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number, idrValue: number) => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  label?: string;
  disabled?: boolean;
}

function useExchangeRate(currency: string) {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const isIDR = currency === "IDR";

  useEffect(() => {
    if (isIDR) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/currency?from=${currency}`);
        const data = await res.json();
        if (!cancelled) setRate(data.rate);
      } catch {
        if (!cancelled) setRate(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [currency, isIDR]);

  return { rate: isIDR ? 1 : rate, loading: isIDR ? false : loading };
}

export default function CurrencyInput({
  value,
  onChange,
  currency,
  onCurrencyChange,
  label = "Harga",
  disabled = false,
}: CurrencyInputProps) {
  const { rate, loading } = useExchangeRate(currency);

  const idrPreview = useMemo(() => {
    if (rate !== null && value) {
      return value * rate;
    }
    return 0;
  }, [rate, value]);

  const handleChange = useCallback(
    (v: number) => {
      const idr = rate ? v * rate : 0;
      onChange(v, idr);
    },
    [rate, onChange]
  );

  const handleCurrencyChange = useCallback(
    (c: string) => {
      onCurrencyChange(c);
    },
    [onCurrencyChange]
  );

  const formatIDR = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div className="flex gap-2">
        <select
          value={currency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          className="w-28 shrink-0 rounded-lg border border-border bg-card px-2 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={disabled}
        >
          <option value="IDR">IDR</option>
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={value || ""}
          onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
          placeholder="0"
          step="0.01"
          min="0"
          className="flex-1 rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={disabled}
        />
      </div>
      {currency !== "IDR" && (
        <div className="text-xs text-muted">
          {loading ? (
            "Mengambil kurs..."
          ) : rate ? (
            <>
              1 {currency} = {formatIDR(rate)} &middot;{" "}
              <span className="font-medium text-foreground">
                ≈ {formatIDR(idrPreview)}
              </span>
            </>
          ) : (
            <span className="text-danger">Gagal memuat kurs</span>
          )}
        </div>
      )}
    </div>
  );
}
