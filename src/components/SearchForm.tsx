'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeftRight, Calendar } from 'lucide-react';
import { Airport } from '@/lib/types';
import { getAirport } from '@/lib/airports';
import { AirportInput } from './AirportInput';
import { cn } from '@/lib/utils';

const TODAY = new Date().toISOString().split('T')[0];
const TOMORROW = new Date(Date.now() + 86400000).toISOString().split('T')[0];

interface Props {
  compact?: boolean;
  initialOrigin?: string;
  initialDestination?: string;
  initialDeparture?: string;
  initialReturn?: string;
}

export function SearchForm({ compact, initialOrigin, initialDestination, initialDeparture, initialReturn }: Props) {
  const router = useRouter();
  const [origin, setOrigin] = useState<Airport | null>(initialOrigin ? (getAirport(initialOrigin) ?? null) : null);
  const [destination, setDestination] = useState<Airport | null>(initialDestination ? (getAirport(initialDestination) ?? null) : null);
  const [departure, setDeparture] = useState(initialDeparture || TOMORROW);
  const [returnDate, setReturnDate] = useState(initialReturn || '');
  const [isRoundTrip, setIsRoundTrip] = useState(!!initialReturn);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function swapAirports() {
    const tmp = origin;
    setOrigin(destination);
    setDestination(tmp);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!origin) { setError('Selecione a cidade de origem'); return; }
    if (!destination) { setError('Selecione o destino'); return; }
    if (origin.iata === destination.iata) { setError('Origem e destino não podem ser iguais'); return; }
    if (!departure) { setError('Selecione a data de ida'); return; }
    if (isRoundTrip && !returnDate) { setError('Selecione a data de volta'); return; }
    if (isRoundTrip && returnDate < departure) { setError('A data de volta deve ser após a data de ida'); return; }

    setLoading(true);

    const params = new URLSearchParams({
      origin: origin.iata,
      destination: destination.iata,
      departure,
      ...(isRoundTrip && returnDate ? { return: returnDate } : {}),
    });

    router.push(`/busca?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className={cn('w-full', compact ? 'space-y-3' : 'space-y-4')}>
      {/* Trip type toggle */}
      {!compact && (
        <div className="flex gap-2">
          {(['Somente ida', 'Ida e volta'] as const).map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setIsRoundTrip(i === 1)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                isRoundTrip === (i === 1)
                  ? 'bg-radar-500/20 text-radar-400 border border-radar-500/40'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Airport inputs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="relative">
          <AirportInput
            label="Origem"
            placeholder="De onde você vai partir?"
            value={origin}
            onChange={setOrigin}
          />
        </div>
        <div className="relative">
          {/* Swap button (desktop only) */}
          <button
            type="button"
            onClick={swapAirports}
            className="absolute -left-4 top-1/2 z-10 hidden -translate-y-1/2 sm:flex items-center justify-center h-7 w-7 rounded-full border border-white/10 bg-dark-700 text-slate-400 hover:text-white hover:border-white/20 transition-all"
            style={{ marginTop: '10px' }}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
          </button>
          <AirportInput
            label="Destino"
            placeholder="Para onde você vai?"
            value={destination}
            onChange={setDestination}
          />
        </div>
      </div>

      {/* Date inputs */}
      <div className={cn('grid gap-3', isRoundTrip ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2')}>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400 uppercase tracking-wider">
            <Calendar className="inline h-3 w-3 mr-1" />
            Data de ida
          </label>
          <input
            type="date"
            value={departure}
            min={TODAY}
            onChange={(e) => setDeparture(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none transition-all focus:border-radar-500/60 focus:ring-2 focus:ring-radar-500/20 hover:border-white/20"
          />
        </div>
        {isRoundTrip && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400 uppercase tracking-wider">
              <Calendar className="inline h-3 w-3 mr-1" />
              Data de volta
            </label>
            <input
              type="date"
              value={returnDate}
              min={departure || TODAY}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none transition-all focus:border-radar-500/60 focus:ring-2 focus:ring-radar-500/20 hover:border-white/20"
            />
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-xl font-semibold transition-all',
          'bg-radar-500 text-white hover:bg-radar-600 active:scale-[0.98]',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          compact ? 'py-3 text-sm' : 'py-4 text-base',
          !loading && 'radar-glow'
        )}
      >
        {loading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Buscando oportunidades...
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Buscar oportunidades
          </>
        )}
      </button>
    </form>
  );
}
