import { getPool } from "./db";

const EXCHANGE_API = "https://api.frankfurter.dev/v1/latest";

export async function getExchangeRate(
  from: string,
  to: string = "IDR"
): Promise<number> {
  if (from === to) return 1;

  const db = await getPool();
  const cached = await db
    .request()
    .input("base", from)
    .input("target", to)
    .query(
      "SELECT rate, fetchedAt FROM CurrencyRate WHERE baseCurrency = @base AND targetCurrency = @target"
    );

  if (cached.recordset[0]) {
    const row = cached.recordset[0];
    const ageMs = Date.now() - new Date(row.fetchedAt).getTime();
    if (ageMs < 60 * 60 * 1000) {
      return row.rate;
    }
  }

  const res = await fetch(`${EXCHANGE_API}?base=${from}&symbols=${to}`);
  if (!res.ok) throw new Error("Failed to fetch exchange rate");
  const data = await res.json();
  const rate = data.rates[to];

  if (!rate) throw new Error(`Rate not found for ${from} → ${to}`);

  await db
    .request()
    .input("base", from)
    .input("target", to)
    .input("rate", rate)
    .input("now", new Date())
    .query(`
      IF EXISTS (SELECT 1 FROM CurrencyRate WHERE baseCurrency = @base AND targetCurrency = @target)
        UPDATE CurrencyRate SET rate = @rate, fetchedAt = @now WHERE baseCurrency = @base AND targetCurrency = @target
      ELSE
        INSERT INTO CurrencyRate (id, baseCurrency, targetCurrency, rate, fetchedAt)
        VALUES (NEWID(), @base, @target, @rate, @now)
    `);

  return rate;
}
