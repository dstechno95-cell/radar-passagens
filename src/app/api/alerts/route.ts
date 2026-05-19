import { NextRequest, NextResponse } from 'next/server';
import { query, isDbAvailable } from '@/lib/db';
import { sendAlertConfirmation } from '@/lib/email';

interface AlertRow { id: string; token: string; }

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS price_alerts (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email            TEXT NOT NULL,
      origin           CHAR(3) NOT NULL,
      destination      CHAR(3) NOT NULL,
      target_price     INTEGER NOT NULL,
      is_round_trip    BOOLEAN NOT NULL DEFAULT FALSE,
      active           BOOLEAN NOT NULL DEFAULT TRUE,
      token            UUID NOT NULL DEFAULT gen_random_uuid(),
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_notified_at TIMESTAMPTZ
    )
  `);
}

export async function POST(req: NextRequest) {
  try {
    if (!isDbAvailable()) {
      return NextResponse.json({ error: 'Banco de dados não disponível' }, { status: 503 });
    }

    await ensureTable();

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });

    const { email, origin, destination, targetPrice, isRoundTrip } = body;

    if (!email || !origin || !destination || !targetPrice) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }
    if (typeof targetPrice !== 'number' || targetPrice < 50) {
      return NextResponse.json({ error: 'Preço alvo inválido' }, { status: 400 });
    }

    const existing = await query(
      'SELECT id FROM price_alerts WHERE email=$1 AND origin=$2 AND destination=$3 AND active=true',
      [email, origin.toUpperCase(), destination.toUpperCase()]
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Alerta já cadastrado para esta rota' }, { status: 409 });
    }

    const [alert] = await query<AlertRow>(
      `INSERT INTO price_alerts (email, origin, destination, target_price, is_round_trip)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, token`,
      [email, origin.toUpperCase(), destination.toUpperCase(), targetPrice, isRoundTrip ?? false]
    );

    // Email em background — erro de envio não impede o cadastro
    sendAlertConfirmation(email, origin, destination, targetPrice, alert.id, alert.token)
      .catch(err => console.error('Email confirmation error:', err));

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('POST /api/alerts error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
