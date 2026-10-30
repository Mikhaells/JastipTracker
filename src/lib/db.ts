import { Pool, type QueryResultRow } from "pg";

const globalForDb = globalThis as unknown as {
  pgPool: Pool | undefined;
};

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL belum diset. Contoh: postgresql://user:password@host/db?sslmode=require"
    );
  }

  const url = new URL(connectionString);
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  const sslDisabled = url.searchParams.get("sslmode") === "disable";

  return new Pool({
    connectionString,
    // Serverless: tiap instance punya pool sendiri, jadi jangan terlalu besar.
    max: Number(process.env.DB_POOL_MAX ?? 5),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
    ssl:
      isLocal || sslDisabled ? undefined : { rejectUnauthorized: false },
  });
}

export function getPool(): Pool {
  if (!globalForDb.pgPool) {
    globalForDb.pgPool = createPool();
  }

  return globalForDb.pgPool;
}

/**
 * Jalankan query dan kembalikan baris hasilnya.
 * Gunakan placeholder posisional (`$1`, `$2`, ...) — bukan `@nama` seperti SQL Server.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await getPool().query<T>(text, params as any[]);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T | undefined> {
  const rows = await query<T>(text, params);
  return rows[0];
}
