import { query, queryOne } from "./db";

const EXCHANGE_API = "https://api.frankfurter.dev/v1/latest";

export async function getExchangeRate(
  from: string,
  to: string = "IDR"
): Promise<number> {
  if (from === to) return 1;

  const cached = await queryOne<{ rate: number; fetchedAt: Date }>(
    `SELECT "rate", "fetchedAt" FROM "CurrencyRate"
     WHERE "baseCurrency" = $1 AND "targetCurrency" = $2`,
    [from, to]
  );

  if (cached) {
    const ageMs = Date.now() - new Date(cached.fetchedAt).getTime();
    if (ageMs < 60 * 60 * 1000) {
      return cached.rate;
    }
  }

  const res = await fetch(`${EXCHANGE_API}?base=${from}&symbols=${to}`);
  if (!res.ok) throw new Error("Failed to fetch exchange rate");
  const data = await res.json();
  const rate = data.rates[to];

  if (!rate) throw new Error(`Rate not found for ${from} → ${to}`);

  await query(
    `INSERT INTO "CurrencyRate" ("id", "baseCurrency", "targetCurrency", "rate", "fetchedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4)
     ON CONFLICT ("baseCurrency", "targetCurrency")
     DO UPDATE SET "rate" = EXCLUDED."rate", "fetchedAt" = EXCLUDED."fetchedAt"`,
    [from, to, rate, new Date()]
  );

  return rate;
}
