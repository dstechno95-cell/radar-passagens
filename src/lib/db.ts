import { Pool } from '@neondatabase/serverless';

let pool: Pool | null = null;

export function getDb(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurado.');
  }
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  values: unknown[] = []
): Promise<T[]> {
  const db = getDb();
  const result = await db.query(sql, values);
  return result.rows as T[];
}

export function isDbAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}
