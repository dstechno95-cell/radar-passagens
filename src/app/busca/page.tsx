'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchForm } from '@/components/SearchForm';
import { FlightCard } from '@/components/FlightCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { PriceComparator } from '@/components/PriceComparator';
import { SearchSummary } from '@/components/SearchSummary';
import { NoResults } from '@/components/NoResults';
import { FlightFilters, SortOption, StopsFilter } from '@/components/FlightFilters';
import { CompareElsewhere } from '@/components/CompareElsewhere';
import { PriceAlertModal } from '@/components/PriceAlertModal';
import { Airline, Flight, SearchResult } from '@/lib/types';
import { getAirport } from '@/lib/airports';
import { formatDate } from '@/lib/utils';

function SearchResults() {
  const params = useSearchParams();
  const origin = params.get('origin') || '';
  const destination = params.get('destination') || '';
  const departure = params.get('departure') || '';
  const returnDate = params.get('return') || '';

  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter / sort state
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [stopsFilter, setStopsFilter] = useState<StopsFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('score');

  const originAirport = getAirport(origin);
  const destAirport = getAirport(destination);

  useEffect(() => {
    if (!origin || !destination || !departure) {
      setError('Parâmetros de busca incompletos.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchFlights() {
      setLoading(true);
      setError('');
      setResult(null);
      setSelectedAirlines([]);
      setStopsFilter('all');
      setSortBy('score');

      try {
        const qs = new URLSearchParams({ origin, destination, departure });
        if (returnDate) qs.set('return', returnDate);

        const res = await fetch(`/api/flights/search?${qs.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Erro na busca');
        }

        const data: SearchResult = await res.json();
        setResult(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message || 'Erro inesperado');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchFlights();
    return () => controller.abort();
  }, [origin, destination, departure, returnDate]);

  // Unique airlines from results
  const availableAirlines = useMemo((): Airline[] => {
    if (!result) return [];
    const seen = new Set<string>();
    return result.flights
      .map((f) => f.outbound.airline)
      .filter((a) => {
        if (seen.has(a.iata)) return false;
        seen.add(a.iata);
        return true;
      });
  }, [result]);

  // Apply filters + sort
  const filteredFlights = useMemo((): Flight[] => {
    if (!result) return [];
    let flights = [...result.flights];

    if (selectedAirlines.length > 0) {
      flights = flights.filter((f) => selectedAirlines.includes(f.outbound.airline.iata));
    }

    if (stopsFilter !== 'all') {
      flights = flights.filter((f) => {
        if (stopsFilter === 'direct') return f.outbound.stops === 0;
        if (stopsFilter === 'one') return f.outbound.stops === 1;
        return f.outbound.stops >= 2;
      });
    }

    switch (sortBy) {
      case 'price':
        flights.sort((a, b) => a.price - b.price);
        break;
      case 'duration':
        flights.sort((a, b) => a.outbound.durationMinutes - b.outbound.durationMinutes);
        break;
      default:
        flights.sort((a, b) => b.opportunityScore - a.opportunityScore || a.price - b.price);
    }

    return flights;
  }, [result, selectedAirlines, stopsFilter, sortBy]);

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-5 sm:px-6">
      {/* Compact search bar */}
      <div className="rounded-2xl border border-white/7 bg-dark-800 p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <span className="font-semibold text-white">
            {originAirport
              ? `${originAirport.flag} ${originAirport.city} (${originAirport.iata})`
              : origin}
            {' → '}
            {destAirport
              ? `${destAirport.flag} ${destAirport.city} (${destAirport.iata})`
              : destination}
          </span>
          {departure && (
            <span className="text-slate-500">
              · {formatDate(`${departure}T12:00:00Z`)}
              {returnDate && ` → ${formatDate(`${returnDate}T12:00:00Z`)}`}
            </span>
          )}
        </div>
        <SearchForm
          compact
          initialOrigin={origin}
          initialDestination={destination}
          initialDeparture={departure}
          initialReturn={returnDate}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/7 bg-dark-800 px-4 py-3 text-sm text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-radar-500/30 border-t-radar-500" />
            <span>Escaneando oportunidades para <strong className="text-white">{originAirport?.city || origin} → {destAirport?.city || destination}</strong>...</span>
          </div>
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Mock data warning */}
          {result.flights.length > 0 && result.flights.every(f => f.provider === 'MockProvider') && (
            <div className="flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/8 px-4 py-3">
              <span className="text-base">⚡</span>
              <p className="text-sm text-yellow-300/80">
                <strong className="text-yellow-300">Preços estimados</strong> — valores simulados para demonstração.
                Ao clicar em <strong>Ver oferta</strong>, você verá os preços reais com as datas corretas.
              </p>
            </div>
          )}

          {/* Cached price warning — aparece quando há voos da Travelpayouts */}
          {result.flights.length > 0 && result.flights.some(f => f.provider === 'Travelpayouts') && !result.flights.every(f => f.provider === 'MockProvider') && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3">
              <span className="text-base">⚠️</span>
              <p className="text-sm text-amber-300/80">
                <strong className="text-amber-300">Alguns preços são indicativos</strong> — obtidos de um cache e podem não refletir o valor atual.
                Clique em <strong>Ver oferta</strong> para ver o preço real antes de comprar.
              </p>
            </div>
          )}

          <SearchSummary
            result={result}
            origin={originAirport?.city || origin}
            destination={destAirport?.city || destination}
          />

          {result.totalFound === 0 ? (
            <NoResults origin={origin} destination={destination} />
          ) : (
            <>
              {/* Filters bar */}
              <FlightFilters
                airlines={availableAirlines}
                selectedAirlines={selectedAirlines}
                onAirlinesChange={setSelectedAirlines}
                stopsFilter={stopsFilter}
                onStopsChange={setStopsFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalFiltered={filteredFlights.length}
                totalAll={result.totalFound}
              />

              <div className="grid gap-5 lg:grid-cols-3">
                {/* Flight list */}
                <div className="space-y-3 lg:col-span-2">
                  {filteredFlights.length === 0 ? (
                    <div className="rounded-2xl border border-white/7 bg-dark-800 py-12 text-center">
                      <p className="text-slate-400 text-sm">Nenhum voo com os filtros selecionados.</p>
                      <button
                        onClick={() => { setSelectedAirlines([]); setStopsFilter('all'); }}
                        className="mt-3 text-sm text-radar-400 hover:text-radar-300 underline"
                      >
                        Limpar filtros
                      </button>
                    </div>
                  ) : (
                    filteredFlights.map((flight, i) => (
                      <FlightCard key={flight.id} flight={flight} index={i} />
                    ))
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  <PriceAlertModal
                    origin={origin}
                    destination={destination}
                    originCity={originAirport?.city || origin}
                    destinationCity={destAirport?.city || destination}
                    currentMinPrice={result.flights.length > 0 ? Math.min(...result.flights.map(f => f.price)) : undefined}
                    isRoundTrip={!!returnDate}
                  />
                  <PriceComparator result={result} />
                  <CompareElsewhere
                    origin={origin}
                    destination={destination}
                    departureDate={departure}
                    returnDate={returnDate || undefined}
                  />

                  {/* Opportunity guide */}
                  <div className="rounded-2xl border border-white/7 bg-dark-800 p-4 space-y-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Legenda do radar
                    </p>
                    {[
                      { emoji: '🔥', label: 'Promoção', desc: '≥ 30% abaixo da média', color: 'text-green-400' },
                      { emoji: '✅', label: 'Bom preço', desc: '15–30% abaixo', color: 'text-emerald-400' },
                      { emoji: '⚠️', label: 'Preço normal', desc: 'Na média', color: 'text-yellow-400' },
                      { emoji: '❌', label: 'Preço alto', desc: 'Acima da média', color: 'text-red-400' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2.5">
                        <span className="text-base">{item.emoji}</span>
                        <div>
                          <span className={`text-xs font-semibold ${item.color}`}>{item.label}</span>
                          <span className="text-xs text-slate-500 ml-1.5">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tip */}
                  <div className="rounded-2xl border border-radar-500/20 bg-radar-500/8 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-radar-400 mb-2">
                      💡 Dica
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Preços mudam rapidamente. Ao clicar em <strong>Ver oferta</strong>, você é redirecionado ao site da companhia para finalizar a compra.
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 text-center leading-relaxed">
                    Radar Passagens é um agregador — não vendemos passagens.
                  </p>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function BuscaPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-3">
              {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          }
        >
          <SearchResults />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
