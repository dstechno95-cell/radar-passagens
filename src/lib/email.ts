import { Resend } from 'resend';
import { getAirport } from './airports';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM_EMAIL || 'Radar Passagens <onboarding@resend.dev>';
const APP    = process.env.NEXT_PUBLIC_APP_URL || 'https://radar-passagens.vercel.app';

function city(iata: string) {
  return getAirport(iata)?.city || iata;
}

function unsubUrl(id: string, token: string) {
  return `${APP}/api/alerts/unsubscribe?id=${id}&token=${token}`;
}

export async function sendAlertConfirmation(
  email: string, origin: string, destination: string,
  targetPrice: number, alertId: string, token: string
) {
  if (!process.env.RESEND_API_KEY) return;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `✅ Alerta criado: ${city(origin)} → ${city(destination)} abaixo de R$ ${targetPrice}`,
    html: confirmationHtml(city(origin), city(destination), targetPrice, unsubUrl(alertId, token)),
  });
}

export async function sendAlertNotification(
  email: string, origin: string, destination: string,
  targetPrice: number, foundPrice: number, link: string,
  alertId: string, token: string
) {
  if (!process.env.RESEND_API_KEY) return;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `🔥 Promoção! ${city(origin)} → ${city(destination)} por R$ ${foundPrice}`,
    html: notificationHtml(city(origin), city(destination), targetPrice, foundPrice, link, unsubUrl(alertId, token)),
  });
}

function base(content: string) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:20px">
  <div style="max-width:520px;margin:0 auto;background:#1e293b;border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.08)">
    <div style="margin-bottom:24px">
      <span style="font-size:22px">✈️</span>
      <span style="font-weight:700;font-size:18px;color:#f97316;margin-left:8px">Radar Passagens</span>
    </div>
    ${content}
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0"/>
    <p style="font-size:11px;color:#475569;text-align:center">
      <a href="${APP}" style="color:#64748b">radar-passagens.vercel.app</a>
    </p>
  </div>
</body></html>`;
}

function confirmationHtml(origin: string, dest: string, price: number, unsub: string) {
  return base(`
    <h2 style="color:#22c55e;font-size:20px;margin:0 0 12px">✅ Alerta criado!</h2>
    <p style="color:#94a3b8;line-height:1.7">
      Vamos monitorar passagens de<br/>
      <strong style="color:#fff;font-size:16px">${origin} → ${dest}</strong><br/>
      e te avisar quando cair abaixo de <strong style="color:#f97316">R$ ${price}</strong>.
    </p>
    <p style="font-size:12px;color:#64748b;margin-top:24px">
      <a href="${unsub}" style="color:#64748b">Cancelar alerta</a>
    </p>
  `);
}

function notificationHtml(origin: string, dest: string, target: number, found: number, link: string, unsub: string) {
  return base(`
    <h2 style="color:#f97316;font-size:20px;margin:0 0 12px">🔥 Promoção encontrada!</h2>
    <p style="color:#94a3b8;line-height:1.7">
      Passagem de <strong style="color:#fff">${origin} → ${dest}</strong><br/>
      por apenas <strong style="color:#22c55e;font-size:26px">R$ ${found}</strong><br/>
      <span style="color:#64748b;font-size:13px">Seu alerta era de R$ ${target}</span>
    </p>
    <a href="${link}" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;margin:20px 0;font-size:15px">
      Ver oferta na Decolar →
    </a>
    <p style="font-size:12px;color:#64748b;margin-top:8px">
      Preços mudam rapidamente — confirme o valor antes de comprar.<br/><br/>
      <a href="${unsub}" style="color:#64748b">Cancelar alerta</a>
    </p>
  `);
}
