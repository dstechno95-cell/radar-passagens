'use client';

import { SlidersHorizontal, X, Check } from 'lucide-react';
import { Airline } from '@/lib/types';
import { cn } from '@/lib/utils';

export type SortOption = 'score' | 'price' | 'duration';
export type StopsFilter = 'all' | 'direct' | 'one' | 'multi';

interface Props {
  airlines: Airline[];
  selectedAirlines: string[];
  onAirlinesChange: (iatas: string[]) => void;
  stopsFilter: StopsFilter;
  onStopsChange: (v: StopsFilter) => void;
  sortBy: SortOption;
  onSortChange: (v: SortOption) => void;
  totalFiltered: number;
  totalAll: number;
}

const STOPS_OPTIONS: { value: StopsFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'direct', label: 'Direto' },
  { value: 'one', label: '1 escala' },
  { value: 'multi', label: '2+ escalas' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'score', label: 'Melhor oferta' },
  { value: 'price', label: 'Menor preço' },
  { value: 'duration', label: 'Menor duração' },
];

export function FlightFilters({
  airlines,
  selectedAirlines,
  onAirlinesChange,
  stopsFilter,
  onStopsChange,
  sortBy,
  onSortChange,
  totalFiltered,
  totalAll,
}: Props) {
  const hasActiveFilters =
    selectedAirlines.length > 0 || stopsFilter !== 'all' || sortBy !== 'score';

  function toggleAirline(iata: string) {
    onAirlinesChange(
      selectedAirlines.includes(iata)
        ? selectedAirlines.filter((a) => a !== iata)
        : [...selectedAirlines, iata]
    );
  }

  function clearAll() {
    onAirlinesChange([]);
    onStopsChange('all');
    onSortChange('score');
  }

  return (
    <div className="rounded-2xl border border-white/7 bg-dark-800 p-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
        {/* Icon + count */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <SlidersHorizontal className="h-4 w-4" />
          <span>
            <strong className="text-white">{totalFiltered}</strong>
            {totalFiltered !== totalAll && (
              <span className="text-slate-500"> de {totalAll}</span>
            )}
            <span className="ml-1">voos</span>
          </span>
        </div>

        {/* Divider */}
        <div className="hidden h-5 w-px bg-white/10 sm:block" />

        {/* Ordenar */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ordenar</span>
          <div className="flex gap-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSortChange(opt.value)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
                  sortBy === opt.value
                    ? 'bg-radar-500/20 text-radar-400 border border-radar-500/40'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/10'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden h-5 w-px bg-white/10 sm:block" />

        {/* Escalas */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Escalas</span>
          <div className="flex gap-1">
            {STOPS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onStopsChange(opt.value)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
                  stopsFilter === opt.value
                    ? 'bg-radar-500/20 text-radar-400 border border-radar-500/40'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/10'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Airlines */}
        {airlines.length > 1 && (
          <>
            <div className="hidden h-5 w-px bg-white/10 sm:block" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cia aérea</span>
              {airlines.map((airline) => {
                const active = selectedAirlines.includes(airline.iata);
                return (
                  <button
                    key={airline.iata}
                    onClick={() => toggleAirline(airline.iata)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all border',
                      active
                        ? 'border-white/20 bg-white/10 text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-white/10'
                    )}
                    style={active ? { borderColor: airline.color + '55', backgroundColor: airline.color + '22', color: airline.color } : {}}
                  >
                    {active && <Check className="h-3 w-3" />}
                    {airline.iata}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
