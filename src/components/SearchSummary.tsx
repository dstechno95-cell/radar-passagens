import { Plane, Clock } from 'lucide-react';
import { SearchResult } from '@/lib/types';
import { getOpportunityConfig } from '@/lib/utils';

interface Props {
  result: SearchResult;
  origin: string;
  destination: string;
}

export function SearchSummary({ result, origin, destination }: Props) {
  const config = getOpportunityConfig(result.bestOpportunity);
  const hasExcellent = result.flights.some((f) => f.opportunity === 'excellent');
  const hasGood = result.flights.some((f) => f.opportunity === 'good');

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Plane className="h-4 w-4 text-radar-400" />
          <h2 className="text-base font-semibold text-white">
            {origin} → {destination}
          </h2>
        </div>
        <p className="mt-0.5 text-sm text-slate-400">
          {result.totalFound} {result.totalFound === 1 ? 'voo encontrado' : 'voos encontrados'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${config.bgColor} ${config.borderColor} ${config.color}`}
        >
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${config.dotColor}`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dotColor}`} />
          </span>
          {hasExcellent
            ? '🔥 Promoções disponíveis!'
            : hasGood
            ? '✅ Bons preços encontrados'
            : '⚠️ Preços normais'}
        </span>

        <div className="flex items-center gap-1 text-xs text-slate-600">
          <Clock className="h-3 w-3" />
          <span>Agora</span>
        </div>
      </div>
    </div>
  );
}
