'use client';

import { useState } from 'react';
import { Bell, X, Check, AlertCircle } from 'lucide-react';

interface Props {
  origin: string;
  destination: string;
  originCity: string;
  destinationCity: string;
  currentMinPrice?: number;
  isRoundTrip?: boolean;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export function PriceAlertModal({ origin, destination, originCity, destinationCity, currentMinPrice, isRoundTrip }: Props) {
  const [open, setOpen]             = useState(false);
  const [email, setEmail]           = useState('');
  const [targetPrice, setTargetPrice] = useState(
    currentMinPrice ? String(Math.round(currentMinPrice * 0.85)) : ''
  );
  const [status, setStatus]         = useState<Status>('idle');
  const [errorMsg, setErrorMsg]     = useState('');

  function close() { setOpen(false); setStatus('idle'); setErrorMsg(''); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          origin,
          destination,
          targetPrice: Number(targetPrice),
          isRoundTrip: isRoundTrip ?? false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar alerta');
      setStatus('success');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro inesperado');
      setStatus('error');
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-radar-500/30 bg-radar-500/10 px-4 py-2.5 text-sm font-semibold text-radar-400 transition-all hover:bg-radar-500/20"
      >
        <Bell className="h-4 w-4" />
        Criar alerta de preço
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={close}>
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-dark-800 p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-radar-400" />
                <h2 className="text-base font-bold text-white">Alerta de preço</h2>
              </div>
              <button onClick={close} className="text-slate-500 transition-colors hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-5 text-sm text-slate-400">
              Avise-me quando{' '}
              <strong className="text-white">{originCity} → {destinationCity}</strong>{' '}
              cair abaixo do preço alvo.
            </p>

            {status === 'success' ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                  <Check className="h-6 w-6 text-green-400" />
                </div>
                <p className="font-semibold text-white">Alerta criado!</p>
                <p className="text-center text-xs text-slate-400">
                  Você receberá um e-mail quando o preço cair abaixo de{' '}
                  <strong className="text-white">R$ {targetPrice}</strong>.
                </p>
                <button onClick={close} className="mt-2 text-sm text-radar-400 hover:text-radar-300">
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Seu e-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-radar-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Preço alvo (R$)</label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={targetPrice}
                    onChange={e => setTargetPrice(e.target.value)}
                    placeholder="ex: 350"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-radar-500/50 focus:outline-none"
                  />
                  {currentMinPrice && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Menor preço encontrado agora: <strong className="text-slate-400">R$ {Math.round(currentMinPrice)}</strong>
                    </p>
                  )}
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                    <p className="text-xs text-red-400">{errorMsg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full rounded-xl bg-radar-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-radar-600 disabled:opacity-50"
                >
                  {status === 'loading' ? 'Criando...' : 'Criar alerta'}
                </button>

                <p className="text-center text-[10px] text-slate-600">
                  Você pode cancelar o alerta a qualquer momento pelo e-mail.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
