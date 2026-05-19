import { NextRequest, NextResponse } from 'next/server';
import { query, isDbAvailable } from '@/lib/db';
import { sendAlertConfirmation } from '@/lib/email';

interface AlertRow { id: string; token: string; }

export async function POST(req: NextRequest) {
  try {
    if (!isDbAvailable()) {
      return NextResponse.json({ error: 'Banco de dados não disponível' }, { status: 503 });
    }

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
    console.error('POST /api/alerts error:', err);
    return NextResponse.json({ error: 'Erro interno ao criar alerta' }, { status: 500 });
  }
}
