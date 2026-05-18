import { isDbAvailable, query } from '@/lib/db';
import { Flight } from '@/lib/types';

interface PriceHistoryRow {
  avg_price: string;
  min_price: string;
  sample_count: string;
}

export async function getAveragePrice(
  origin: string,
  destination: string,
  travelMonth: string
): Promise<number | null> {
  if (!isDbAvailable()) return null;
  try {
    const rows = await query<PriceHistoryRow>(
      `SELECT avg_price, min_price, sample_count
       FROM price_history
       WHERE origin = $1 AND destination = $2 AND travel_month = $3
       LIMIT 1`,
      [origin, destination, travelMonth]
    );
    if (rows.length === 0) return null;
    return parseFloat(rows[0].avg_price);
  } catch {
    return null;
  }
}

export async function upsertPriceHistory(
  origin: string,
  destination: string,
  travelMonth: string,
  price: number
): Promise<void> {
  if (!isDbAvailable()) return;
  try {
    await query(
      `INSERT INTO price_history (origin, destination, travel_month, avg_price, min_price, max_price, sample_count)
       VALUES ($1, $2, $3, $4, $4, $4, 1)
       ON CONFLICT (origin, destination, travel_month)
       DO UPDATE SET
         avg_price = (price_history.avg_price * price_history.sample_count + $4) / (price_history.sample_count + 1),
         min_price = LEAST(price_history.min_price, $4),
         max_price = GREATEST(price_history.max_price, $4),
         sample_count = price_history.sample_count + 1,
         updated_at = NOW()`,
      [origin, destination, travelMonth, price]
    );
  } catch {
    // Falha silenciosa — não bloqueia a busca
  }
}

export async function saveSearchToDb(
  searchId: string,
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string | undefined,
  flights: Flight[]
): Promise<void> {
  if (!isDbAvailable()) return;
  try {
    // Salva a busca
    await query(
      `INSERT INTO flight_searches (id, origin, destination, departure, return_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
      [searchId, origin, destination, departureDate, returnDate || null]
    );

    // Salva cada voo e atualiza histórico de preços
    const travelMonth = departureDate.slice(0, 7);
    for (const flight of flights) {
      await query(
        `INSERT INTO flights
           (search_id, provider, origin, destination, departure_date, return_date,
            airline_iata, airline_name, flight_number,
            outbound_departure, outbound_arrival, outbound_duration, outbound_stops,
            inbound_departure, inbound_arrival, inbound_duration, inbound_stops,
            price, currency, link, opportunity, opportunity_score, pct_vs_average, average_price)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
         ON CONFLICT DO NOTHING`,
        [
          searchId,
          flight.provider,
          origin,
          destination,
          departureDate,
          returnDate || null,
          flight.outbound.airline.iata,
          flight.outbound.airline.name,
          flight.outbound.flightNumber,
          flight.outbound.departureTime,
          flight.outbound.arrivalTime,
          flight.outbound.durationMinutes,
          flight.outbound.stops,
          flight.inbound?.departureTime || null,
          flight.inbound?.arrivalTime || null,
          flight.inbound?.durationMinutes || null,
          flight.inbound?.stops ?? null,
          flight.price,
          flight.currency,
          flight.link,
          flight.opportunity,
          flight.opportunityScore,
          flight.percentageVsAverage,
          flight.averagePrice,
        ]
      );
      await upsertPriceHistory(origin, destination, travelMonth, flight.price);
    }
  } catch {
    // Falha silenciosa — DB não bloqueia a resposta
  }
}
