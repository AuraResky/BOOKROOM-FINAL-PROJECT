import "server-only";
import pg from "pg";

const { Pool } = pg;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum diatur.");
  }

  if (!globalThis.bookversePool) {
    globalThis.bookversePool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    globalThis.bookversePool.on("error", () => {
      console.error("Koneksi PostgreSQL terputus.");
    });
  }

  return globalThis.bookversePool;
}