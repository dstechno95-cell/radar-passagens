import { Flight, OpportunityLevel, SearchParams, SearchResult } from '@/lib/types';
import { providers } from '@/providers';
import { generateId } from '@/lib/utils';

export async function searchFlights(params: SearchParams): Promise<SearchResult> {
  const results = await Promise.allSettled(
    providers.map((provider) => provider.searchFlights(params))
  );

  const raw: Flight[] = results
    .filter((r): r is PromiseFulfilledResult<Flight[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  // Deduplicate across providers: same airline + flight number + date → keep cheapest
  const deduped = new Map<string, Flight>();
  for (const flight of raw) {
    const key = `${flight.outbound.airline.iata}-${flight.outbound.flightNumber}-${flight.outbound.departureTime.slice(0, 10)}`;
    const existing = deduped.get(key);
    if (!existing || flight.price < existing.price) deduped.set(key, flight);
  }
  const flights = Array.from(deduped.values());

  if (flights.length === 0) {
    return {
      flights: [],
      totalFound: 0,
      searchId: generateId(),
      minPrice: 0,
      maxPrice: 0,
      avgPrice: 0,
      bestOpportunity: 'normal',
      searchedAt: new Date().toISOString(),
    };
  }

  const prices = flights.map((f) => f.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  const opportunityRank: Record<OpportunityLevel, number> = {
    excellent: 4,
    good: 3,
    normal: 2,
    expensive: 1,
  };

  const bestOpportunity = flights.reduce((best, f) =>
    opportunityRank[f.opportunity] > opportunityRank[best] ? f.opportunity : best,
    'normal' as OpportunityLevel
  );

  const sorted = flights.sort((a, b) => {
    const scoreDiff = b.opportunityScore - a.opportunityScore;
    return scoreDiff !== 0 ? scoreDiff : a.price - b.price;
  });

  return {
    flights: sorted,
    totalFound: flights.length,
    searchId: generateId(),
    minPrice,
    maxPrice,
    avgPrice,
    bestOpportunity,
    searchedAt: new Date().toISOString(),
  };
}
