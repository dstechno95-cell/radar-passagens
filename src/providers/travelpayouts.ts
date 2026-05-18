import { Flight, FlightProvider, FlightSegment, SearchParams } from '@/lib/types';
import { getAirport } from '@/lib/airports';
import { scoreOpportunity } from '@/services/opportunityScorer';
import { generateId } from '@/lib/utils';

const API_V3       = 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates';
const API_V1_CHEAP = 'https://api.travelpayouts.com/v1/prices/cheap';
const AVIASALES_BR = 'https://www.aviasales.com';
const MARKER       = process.env.TRAVELPAYOUTS_MARKER || '530450';

const AIRLINE_MAP: Record<string, { name: string; color: string }> = {
  G3:  { name: 'GOL Linhas Aéreas',    color: '#FF6600' },
  LA:  { name: 'LATAM Airlines',        color: '#E31837' },
  JJ:  { name: 'LATAM Brasil',          color: '#E31837' },
  AD:  { name: 'Azul Linhas Aéreas',    color: '#004B87' },
  AA:  { name: 'American Airlines',     color: '#0078D2' },
  CM:  { name: 'Copa Airlines',         color: '#002B7F' },
  TP:  { name: 'TAP Air Portugal',      color: '#006437' },
  IB:  { name: 'Iberia',                color: '#C8102E' },
  AF:  { name: 'Air France',            color: '#002157' },
  EK:  { name: 'Emirates',              color: '#C41A23' },
  LH:  { name: 'Lufthansa',             color: '#05164D' },
  KL:  { name: 'KLM',                   color: '#00A1DE' },
  QR:  { name: 'Qatar Airways',         color: '#5C0632' },
  UA:  { name: 'United Airlines',       color: '#002244' },
  DL:  { name: 'Delta Air Lines',       color: '#CC0000' },
  TK:  { name: 'Turkish Airlines',      color: '#E81932' },
  '2Z':{ name: 'Passaredo',             color: '#0066CC' },
  AV:  { name: 'Avianca',               color: '#C8102E' },
  AM:  { name: 'Aeroméxico',            color: '#003087' },
  H2:  { name: 'Sky Airline',           color: '#0070C0' },
  JA:  { name: 'JetSMART',             color: '#FFC72C' },
  AR:  { name: 'Aerolíneas Argentinas', color: '#74ACDF' },
  BA:  { name: 'British Airways',       color: '#2B5EAB' },
  LX:  { name: 'SWISS',                 color: '#E30614' },
  OS:  { name: 'Austrian Airlines',     color: '#CC0000' },
  SK:  { name: 'SAS',                   color: '#003087' },
  AZ:  { name: 'ITA Airways',           color: '#007DB8' },
  WN:  { name: 'Southwest Airlines',    color: '#304CB2' },
  B6:  { name: 'JetBlue',              color: '#003876' },
  F9:  { name: 'Frontier Airlines',     color: '#00843D' },
  NK:  { name: 'Spirit Airlines',       color: '#FFD700' },
};

function getAirline(iata: string) {
  const info = AIRLINE_MAP[iata] ?? { name: iata, color: '#64748b' };
  return { iata, ...info };
}

// Médias históricas por rota (BRL, somente ida)
const ROUTE_AVGS: Record<string, number> = {
  'GRU-SDU': 420,  'GRU-CGH': 350,  'GRU-BSB': 580,  'GRU-SSA': 720,
  'GRU-REC': 850,  'GRU-FOR': 980,  'GRU-NAT': 920,  'GRU-MCZ': 890,
  'GRU-POA': 490,  'GRU-CWB': 380,  'GRU-FLN': 410,  'GRU-MAO': 860,
  'GRU-BEL': 780,  'GRU-VIX': 450,  'GRU-GYN': 480,  'GRU-THE': 920,
  'GRU-MIA': 2800, 'GRU-JFK': 3400, 'GRU-LAX': 3900, 'GRU-MCO': 2600,
  'GRU-LIS': 3800, 'GRU-MAD': 3600, 'GRU-CDG': 4200, 'GRU-LHR': 4800,
  'GRU-FRA': 4500, 'GRU-AMS': 4300, 'GRU-FCO': 4100, 'GRU-ZRH': 4600,
  'GRU-SCL': 1100, 'GRU-EZE': 900,  'GRU-BOG': 1800, 'GRU-LIM': 1600,
  'GRU-DXB': 5200, 'GRU-DOH': 5000, 'GRU-NRT': 6200,
  'CGH-BSB': 520,  'CGH-SSA': 680,  'CGH-REC': 800,  'CGH-FOR': 920,
  'CGH-POA': 420,  'CGH-CWB': 320,  'CGH-FLN': 360,  'CGH-GIG': 340,
  'GIG-BSB': 560,  'GIG-SSA': 640,  'GIG-REC': 760,  'GIG-FOR': 900,
  'GIG-POA': 510,  'GIG-CWB': 460,  'GIG-FLN': 490,  'GIG-MAO': 920,
  'BSB-SSA': 480,  'BSB-REC': 650,  'BSB-FOR': 720,  'BSB-MAO': 750,
  'BSB-BEL': 680,  'BSB-POA': 640,  'BSB-CWB': 580,
  'SSA-REC': 380,  'SSA-FOR': 450,  'SSA-MCZ': 320,  'SSA-NAT': 350,
  'POA-GRU': 490,  'POA-GIG': 550,  'POA-BSB': 620,  'POA-SSA': 780,
  'CWB-GRU': 380,  'CWB-GIG': 430,  'CWB-BSB': 580,
  'FLN-GRU': 410,  'FLN-GIG': 460,  'FLN-BSB': 600,
};

function getAvgPrice(origin: string, dest: string): number {
  return ROUTE_AVGS[`${origin}-${dest}`] ?? ROUTE_AVGS[`${dest}-${origin}`] ?? 1500;
}

function buildLink(path: string): string {
  try {
    const base = path.startsWith('http') ? path : `${AVIASALES_BR}${path}`;
    const url = new URL(base);
    url.searchParams.set('marker', MARKER);
    url.searchParams.set('currency', 'brl');
    url.searchParams.set('locale', 'pt');
    return url.toString();
  } catch {
    return `${AVIASALES_BR}${path}`;
  }
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().split('T')[0];
}

function flightKey(airline: string, flightNumber: number | string, departureAt: string): string {
  return `${airline}${flightNumber}-${departureAt.slice(0, 10)}`;
}

// ─── v3 types ────────────────────────────────────────────────────────────────

interface TPTicket {
  origin: string;
  destination: string;
  origin_airport: string;
  destination_airport: string;
  price: number;
  airline: string;
  flight_number: number;
  departure_at: string;
  return_at: string | null;
  transfers: number;
  return_transfers: number;
  duration: number;
  duration_to: number;
  duration_back: number;
  link: string;
}

// ─── v1/prices/cheap types ───────────────────────────────────────────────────

interface TPCheapEntry {
  price: number;
  airline: string;
  flight_number: number;
  departure_at: string;
  return_at: string | null;
  transfers: number;
  return_transfers: number;
  duration: number;
  duration_to: number;
  duration_back: number;
  link: string;
}

// ─── Segment builders ────────────────────────────────────────────────────────

function buildSegmentV3(ticket: TPTicket, isReturn: boolean): FlightSegment {
  const originIata  = isReturn ? ticket.destination_airport : ticket.origin_airport;
  const destIata    = isReturn ? ticket.origin_airport      : ticket.destination_airport;
  const departureAt = isReturn ? ticket.return_at!          : ticket.departure_at;
  const duration    = isReturn ? (ticket.duration_back || ticket.duration_to) : (ticket.duration_to || ticket.duration);
  const stops       = isReturn ? ticket.return_transfers    : ticket.transfers;

  return makeSegment(originIata, destIata, departureAt, duration, stops, ticket.airline, ticket.flight_number);
}

function buildSegmentV1(entry: TPCheapEntry, originIata: string, destIata: string, isReturn: boolean): FlightSegment {
  const oIata       = isReturn ? destIata   : originIata;
  const dIata       = isReturn ? originIata : destIata;
  const departureAt = isReturn ? entry.return_at! : entry.departure_at;
  const duration    = isReturn ? (entry.duration_back || entry.duration_to) : (entry.duration_to || entry.duration);
  const stops       = isReturn ? entry.return_transfers : entry.transfers;

  return makeSegment(oIata, dIata, departureAt, duration, stops, entry.airline, entry.flight_number);
}

function makeSegment(
  originIata: string, destIata: string,
  departureAt: string, durationMin: number, stops: number,
  airlineIata: string, flightNum: number
): FlightSegment {
  const origin      = getAirport(originIata) ?? { iata: originIata, name: originIata, city: originIata, country: '', flag: '🌍' };
  const destination = getAirport(destIata)   ?? { iata: destIata,   name: destIata,   city: destIata,   country: '', flag: '🌍' };
  const dep = new Date(departureAt);
  const arr = new Date(dep.getTime() + durationMin * 60_000);

  return {
    origin,
    destination,
    departureTime:   dep.toISOString(),
    arrivalTime:     arr.toISOString(),
    durationMinutes: durationMin,
    stops,
    stopDetails: [],
    airline:      getAirline(airlineIata),
    flightNumber: `${airlineIata}${flightNum}`,
  };
}

// ─── API fetch helpers ───────────────────────────────────────────────────────

async function fetchV3(
  origin: string, destination: string,
  departureDate: string, returnDate: string | undefined,
  token: string, limit = 6
): Promise<TPTicket[]> {
  const isRoundTrip = !!returnDate;
  const qs = new URLSearchParams({
    origin, destination,
    departure_at: departureDate,
    unique:   'false',
    sorting:  'price',
    direct:   'false',
    currency: 'brl',
    limit:    String(limit),
    one_way:  isRoundTrip ? 'false' : 'true',
    token,
  });
  if (isRoundTrip && returnDate) qs.set('return_at', returnDate);

  try {
    const res = await fetch(`${API_V3}?${qs}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

async function fetchV1Cheap(
  origin: string, destination: string,
  departureDate: string, returnDate: string | undefined,
  token: string
): Promise<TPCheapEntry[]> {
  const qs = new URLSearchParams({
    origin, destination,
    depart_date: departureDate.slice(0, 7), // YYYY-MM
    currency: 'brl',
    token,
  });
  if (returnDate) qs.set('return_date', returnDate.slice(0, 7));

  try {
    const res = await fetch(`${API_V1_CHEAP}?${qs}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    if (!json.success || !json.data) return [];
    return parseCheapData(json.data);
  } catch {
    return [];
  }
}

// Handles both flat {date: entry} and nested {dest: {date: entry}} response shapes
function parseCheapData(data: Record<string, unknown>): TPCheapEntry[] {
  const entries: TPCheapEntry[] = [];
  for (const val of Object.values(data)) {
    if (!val || typeof val !== 'object') continue;
    if ('price' in val) {
      entries.push(val as TPCheapEntry);
    } else {
      for (const inner of Object.values(val as Record<string, unknown>)) {
        if (inner && typeof inner === 'object' && 'price' in inner) {
          entries.push(inner as TPCheapEntry);
        }
      }
    }
  }
  return entries;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export const travelpayoutsProvider: FlightProvider = {
  name: 'Travelpayouts',

  async searchFlights(params: SearchParams): Promise<Flight[]> {
    const token = process.env.TRAVELPAYOUTS_TOKEN;
    if (!token) return [];

    const { origin, destination, departureDate, returnDate } = params;
    const isRoundTrip = !!returnDate;
    const avgPrice    = getAvgPrice(origin, destination) * (isRoundTrip ? 1.85 : 1);

    const seen    = new Set<string>();
    const flights: Flight[] = [];

    function addTicketsV3(tickets: TPTicket[]) {
      for (const t of tickets) {
        const key = flightKey(t.airline, t.flight_number, t.departure_at);
        if (seen.has(key)) continue;
        seen.add(key);

        const outbound = buildSegmentV3(t, false);
        const inbound  = isRoundTrip && t.return_at ? buildSegmentV3(t, true) : undefined;
        const scored   = scoreOpportunity(t.price, avgPrice);

        flights.push({
          id: generateId(), outbound, inbound,
          price: t.price, currency: 'BRL',
          link:  buildLink(t.link),
          provider: 'Travelpayouts',
          ...scored,
          averagePrice: Math.round(avgPrice),
          scrapedAt: new Date().toISOString(),
        });
      }
    }

    // Step 1 — exact date, up to 10 results
    const exactTickets = await fetchV3(origin, destination, departureDate, returnDate, token, 10);
    addTicketsV3(exactTickets);

    // Step 2 — if still thin, search ±1, ±2, ±3 days in parallel
    if (flights.length < 4) {
      const flexDates = [-1, 1, -2, 2, -3, 3].map(n => addDays(departureDate, n));
      const flexBatches = await Promise.all(
        flexDates.map(d => fetchV3(origin, destination, d, returnDate, token, 4))
      );
      for (const batch of flexBatches) addTicketsV3(batch);
    }

    // Step 3 — monthly cheapest fallback when route has sparse data
    if (flights.length < 3) {
      const cheapEntries = await fetchV1Cheap(origin, destination, departureDate, returnDate, token);

      for (const entry of cheapEntries) {
        const key = flightKey(entry.airline, entry.flight_number, entry.departure_at);
        if (seen.has(key)) continue;
        seen.add(key);

        const outbound = buildSegmentV1(entry, origin, destination, false);
        const inbound  = isRoundTrip && entry.return_at ? buildSegmentV1(entry, origin, destination, true) : undefined;
        const scored   = scoreOpportunity(entry.price, avgPrice);

        flights.push({
          id: generateId(), outbound, inbound,
          price: entry.price, currency: 'BRL',
          link:  buildLink(entry.link),
          provider: 'Travelpayouts',
          ...scored,
          averagePrice: Math.round(avgPrice),
          scrapedAt: new Date().toISOString(),
        });
      }
    }

    // Sort: best opportunity first, then cheapest
    flights.sort((a, b) => b.opportunityScore - a.opportunityScore || a.price - b.price);

    return flights.slice(0, 20);
  },
};
