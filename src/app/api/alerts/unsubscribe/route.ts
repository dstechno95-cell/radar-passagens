import { NextRequest, NextResponse } from 'next/server';
import { query, isDbAvailable } from '@/lib/db';

export async function GET(req: NextRequest) {
  const id    = req.nextUrl.searchParams.get('id');
  const token = req.nextUrl.searchParams.get('token');

  if (!id || !token) {
    return new NextResponse('Link inválido.', { status: 400, headers: { 'Content-Type': 'text/plain' } });
  }

  if (!isDbAvailable()) {
    return new NextResponse('Serviço indisponível.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }

  const result = await query(
    'UPDATE price_alerts SET active=false WHERE id=$1 AND token=$2 RETURNING id',
    [id, token]
  );

  if (result.length === 0) {
    return new NextResponse('Alerta não encontrado ou já cancelado.', { status: 404, headers: { 'Content-Type': 'text/plain' } });
  }

  return new NextResponse(
    `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
      <div style="text-align:center;padding:40px">
        <div style="font-size:48px">✅</div>
        <h2 style="color:#fff;margin:16px 0 8px">Alerta cancelado</h2>
        <p style="color:#94a3b8">Você não receberá mais notificações para esta rota.</p>
        <a href="/" style="display:inline-block;margin-top:24px;color:#f97316;text-decoration:none;font-weight:600">← Voltar ao Radar Passagens</a>
      </div>
    </body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  );
}
