import { NextRequest, NextResponse } from 'next/server';
import { query, isDbAvailable } from '@/lib/db';
import { sendAlertNotification } from '@/lib/email';

interface AlertRow {
  id: string;
  email: string;
  origin: string;
  destination: string;
  target_price: number;
  is_round_trip: boolean;
  token: string;
}

interface PriceResult { price: number; link: string; }

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isDbAvailable()) return NextResponse.json({ error: 'DB indisponível' }, { status: 503 });

  const alerts = await query<AlertRow>(`
    SELECT id, email, origin, destination, target_price, is_round_trip, token
    FROM price_alerts
    WHERE active = true
      AND (last_notified_at IS NULL OR last_notified_at < NOW() - INTERVAL '23 hours')
  `);

  if (alerts.length === 0) return NextResponse.json({ checked: 0, notified: 0 });

  // Group alerts by route to avoid duplicate API calls
  const routeMap = new Map<string, AlertRow[]>();
  for (const alert of alerts) {
    const key = `${alert.origin}-${alert.destination}`;
    if (!routeMap.has(key)) routeMap.set(key, []);
    routeMap.get(key)!.push(alert);
  }

  let notified = 0;

  for (const [, routeAlerts] of routeMap) {
    const { origin, destination } = routeAlerts[0];
    const result = await fetchMinPrice(origin, destination);
    if (!result) continue;

    for (const alert of routeAlerts) {
      if (result.price <= alert.target_price) {
        await sendAlertNotification(
          alert.email, alert.origin, alert.destination,
          alert.target_price, result.price, result.link,
          alert.id, alert.token
        );
        await query(
          'UPDATE price_alerts SET last_notified_at = NOW() WHERE id = $1',
          [alert.id]
        );
        notified++;
      }
    }
  }

  return NextResponse.json({ checked: routeMap.size, notified });
}

async function fetchMinPrice(origin: string, destination: string): Promise<PriceResult | null> {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) return null;

  const now   = new Date();
  const next  = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const months = [
    now.toISOString().slice(0, 7),
    next.toISOString().slice(0, 7),
  ];

  let minPrice: number | null = null;

  for (const month of months) {
    try {
      const qs = new URLSearchParams({ origin, destination, depart_date: month, currency: 'brl', token });
      const res = await fetch(`https://api.travelpayouts.com/v1/prices/cheap?${qs}`);
      if (!res.ok) continue;
      const json = await res.json();
      if (!json.success || !json.data) continue;

      for (const val of Object.values(json.data)) {
        if (!val || typeof val !== 'object') continue;
        const entry = val as Record<string, unknown>;
        if (typeof entry.price === 'number' && (minPrice === null || entry.price < minPrice)) {
          minPrice = entry.price;
        }
        // Handle nested { dest: { date: entry } }
        for (const inner of Object.values(entry)) {
          if (inner && typeof inner === 'object' && 'price' in inner) {
            const p = (inner as Record<string, unknown>).price;
            if (typeof p === 'number' && (minPrice === null || p < minPrice)) minPrice = p;
          }
        }
      }
    } catch { /* ignore per-route errors */ }
  }

  if (!minPrice) return null;

  const dep = now.toISOString().slice(0, 7) + '-15';
  return {
    price: minPrice,
    link:  `https://www.decolar.com/shop/flights/results/oneway/${origin}/${destination}/${dep}/1/0/0`,
  };
}
