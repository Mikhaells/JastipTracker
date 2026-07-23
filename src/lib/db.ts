import sql from "mssql";

const useWindowsAuth = !process.env.DB_USER;

const config: sql.config = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "jastip_tracker",
  ...(useWindowsAuth
    ? {}
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }),
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST === "true",
    ...(useWindowsAuth ? { trustedConnection: true } : {}),
  },
};

const globalForPool = globalThis as unknown as {
  pool: sql.ConnectionPool | undefined;
};

if (!globalForPool.pool) {
  globalForPool.pool = new sql.ConnectionPool(config);
}

export async function getPool(): Promise<sql.ConnectionPool> {
  const p = globalForPool.pool!;
  if (!p.connected) {
    await p.connect();
  }
  return p;
}
