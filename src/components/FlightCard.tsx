import { ExternalLink, ArrowRight, Minus } from 'lucide-react';
import { Flight } from '@/lib/types';
import { formatPrice, formatTime, formatDate, formatDuration, cn } from '@/lib/utils';
import { OpportunityBadge } from './OpportunityBadge';

interface Props {
  flight: Flight;
  index?: number;
}

function AirlineAvatar({ iata, color }: { iata: string; name: string; color: string }) {
  return (
    <div
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
      style={{ backgroundColor: color + '33', border: `1px solid ${color}44` }}
    >
      <span style={{ color }}>{iata}</span>
    </div>
  );
}

function SegmentRow({ segment }: { segment: Flight['outbound'] }) {
  return (
    <div className="flex flex-1 items-center gap-3">
      {/* Origin */}
      <div className="text-center">
        <p className="text-lg font-bold text-white leading-none">{formatTime(segment.departureTime)}</p>
        <p className="text-[10px] text-slate-600 leading-none">{formatDate(segment.departureTime)}</p>
        <p className="mt-0.5 text-xs font-semibold text-slate-400">{segment.origin.iata}</p>
      </div>

      {/* Line */}
      <div className="flex flex-1 flex-col items-center gap-1 min-w-0">
        <div className="flex w-full items-center gap-1">
          <div className="h-px flex-1 bg-white/15" />
          <ArrowRight className="h-3 w-3 flex-shrink-0 text-slate-500" />
        </div>
        <p className="text-xs text-slate-500">
          {formatDuration(segment.durationMinutes)}
          {' · '}
          {segment.stops === 0 ? (
            <span className="text-green-400">Direto</span>
          ) : (
            <span className="text-yellow-400">
              {segment.stops} {segment.stops === 1 ? 'escala' : 'escalas'}
            </span>
          )}
        </p>
      </div>

      {/* Destination */}
      <div className="text-center">
        <p className="text-lg font-bold text-white leading-none">{formatTime(segment.arrivalTime)}</p>
        <p className="mt-0.5 text-xs font-semibold text-slate-400">{segment.destination.iata}</p>
      </div>
    </div>
  );
}

export function FlightCard({ flight, index = 0 }: Props) {
  const isExcellent = flight.opportunity === 'excellent';
  const isGood = flight.opportunity === 'good';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
        'bg-dark-800',
        isExcellent
          ? 'border-green-500/25 hover:border-green-500/40 hover:shadow-green-500/10'
          : isGood
          ? 'border-emerald-500/20 hover:border-emerald-500/35 hover:shadow-emerald-500/10'
          : 'border-white/7 hover:border-white/15',
        'animate-in'
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Glow bar for excellent deals */}
      {isExcellent && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 to-green-600" />
      )}

      <div className="p-4 sm:p-5">
        {/* Main row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Airline */}
          <div className="flex items-center gap-3 sm:w-40 sm:flex-shrink-0">
            <AirlineAvatar
              iata={flight.outbound.airline.iata}
              name={flight.outbound.airline.name}
              color={flight.outbound.airline.color}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {flight.outbound.airline.name}
              </p>
              <p className="text-xs text-slate-500">{flight.outbound.flightNumber}</p>
            </div>
          </div>

          {/* Segments */}
          <div className="flex flex-1 flex-col gap-3">
            <SegmentRow segment={flight.outbound} />
            {flight.inbound && (
              <>
                <div className="flex items-center gap-2">
                  <Minus className="h-3 w-3 text-slate-600" />
                  <p className="text-xs text-slate-600">Volta</p>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <SegmentRow segment={flight.inbound} />
              </>
            )}
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center sm:w-44 sm:flex-shrink-0">
            <div className="sm:text-right">
              <OpportunityBadge
                level={flight.opportunity}
                percentageVsAverage={flight.percentageVsAverage}
                size="sm"
              />
              <p className="mt-1 text-2xl font-bold text-white">
                {formatPrice(flight.price, flight.currency)}
              </p>
              <p className="text-xs text-slate-500">
                Média: {formatPrice(flight.averagePrice, flight.currency)}
              </p>
              {flight.provider === 'MockProvider' || flight.provider === 'Travelpayouts' ? (
                <p className="text-[10px] text-amber-500/80 mt-0.5">
                  {flight.provider === 'MockProvider' ? '⚡ Preço estimado' : '⚠️ Preço indicativo · Decolar'}
                </p>
              ) : (
                <p className="text-[10px] text-green-500/70 mt-0.5">
                  {flight.provider === 'Google Flights' ? '🔍 Google Flights · Tempo real' : '🥝 Kiwi.com · Tempo real'}
                </p>
              )}
              {flight.provider === 'Travelpayouts' && (
                <p className="text-[10px] text-amber-600/60 mt-0.5 max-w-[120px] leading-tight">
                  Confirme o valor ao clicar
                </p>
              )}
            </div>

            <a
              href={flight.link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
                'whitespace-nowrap',
                isExcellent || isGood
                  ? 'bg-radar-500 text-white hover:bg-radar-600'
                  : 'bg-white/8 text-slate-300 hover:bg-white/12 hover:text-white border border-white/10'
              )}
            >
              Ver oferta
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
