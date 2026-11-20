import { Pool, types } from 'pg';

types.setTypeParser(1082, (v) => v);
types.setTypeParser(20, (v) => parseInt(v, 10));
types.setTypeParser(1700, (v) => parseFloat(v));

const TZ = process.env.APP_TIMEZONE || 'Asia/Makassar';

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL belum diatur. Salin .env.example menjadi .env.local lalu isi koneksi PostgreSQL.');
  }
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    options: `-c timezone=${TZ}`,
  });
}

const g = globalThis;
function getPool() {
  if (!g.__bookroomPool) g.__bookroomPool = createPool();
  return g.__bookroomPool;
}

export async function query(text, params = []) {
  const res = await getPool().query(text, params);
  return res.rows;
}

export async function one(text, params = []) {
  const rows = await query(text, params);
  return rows[0] ?? null;
}


export async function transaction(fn) {
  const client = await getPool().connect();
  const tx = {
    query: async (t, p = []) => (await client.query(t, p)).rows,
    one: async (t, p = []) => (await client.query(t, p)).rows[0] ?? null,
  };
  try {
    await client.query('BEGIN');
    const result = await fn(tx);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export const isUniqueViolation = (err) => err?.code === '23505';
export const isForeignKeyViolation = (err) => err?.code === '23503';
