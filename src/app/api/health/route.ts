import { NextResponse } from 'next/server';
import { isDbAvailable, query } from '@/lib/db';

export async function GET() {
  const dbAvailable = isDbAvailable();
  let dbConnected = false;
  let searchCount = 0;

  if (dbAvailable) {
    try {
      const rows = await query<{ count: string }>('SELECT COUNT(*) as count FROM flight_searches');
      dbConnected = true;
      searchCount = parseInt(rows[0]?.count ?? '0', 10);
    } catch {
      dbConnected = false;
    }
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    db: {
      configured: dbAvailable,
      connected: dbConnected,
      searchCount,
    },
  });
}
