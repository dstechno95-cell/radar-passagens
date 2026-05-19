import { Flight, FlightProvider, FlightSegment, SearchParams } from '@/lib/types';
import { getAirport } from '@/lib/airports';
import { scoreOpportunity } from '@/services/opportunityScorer';
import { generateId } from '@/lib/utils';

const API_BASE = 'https://serpapi.com/search.json';

const AIRLINE_NAMES: Record<string, string> = {
  G3: 'GOL Linhas Aéreas',    LA: 'LATAM Airlines',        JJ: 'LATAM Brasil',
  AD: 'Azul Linhas Aéreas',   AA: 'American Airlines',     CM: 'Copa Airlines',
  TP: 'TAP Air Portugal',     IB: 'Iberia',                AF: 'Air France',
  EK: 'Emirates',             LH: 'Lufthansa',             KL: 'KLM',
  QR: 'Qatar Airways',        UA: 'United Airlines',       DL: 'Delta Air Lines',
  TK: 'Turkish Airlines',     '2Z': 'Passaredo',           AV: 'Avianca',
  AM: 'Aeroméxico',           H2: 'Sky Airline',           BA: 'British Airways',
  LX: 'SWISS',                AR: 'Aerolíneas Argentinas', AZ: 'ITA Airways',
  B6: 'JetBlue',              WN: 'Southwest Airlines',
};

const AIRLINE_COLORS: Record<string, string> = {
  G3: '#FF6600', LA: '#E31837', JJ: '#E31837', AD: '#004B87',
  AA: '#0078D2', CM: '#002B7F', TP: '#006437', IB: '#C8102E',
  AF: '#002157', EK: '#C41A23', LH: '#05164D', KL: '#00A1DE',
  QR: '#5C0632', UA: '#002244', DL: '#CC0000', TK: '#E81932',
  '2Z': '#0066CC', AV: '#C8102E', AM: '#003087', H2: '#0070C0',
  BA: '#2B5EAB', LX: '#E30614', AR: '#74ACDF', AZ: '#007DB8',
};

const ROUTE_AVGS: Record<string, number> = {
  'GRU-SDU': 420,  'GRU-CGH': 350,  'GRU-BSB': 580,  'GRU-SSA': 720,
  'GRU-REC': 850,  'GRU-FOR': 980,  'GRU-NAT': 920,  'GRU-MCZ': 890,
  'GRU-POA': 490,  'GRU-CWB': 380,  'GRU-FLN': 410,  'GRU-MAO': 860,
  'GRU-BEL': 780,  'GRU-VIX': 450,  'GRU-GYN': 480,
  'GRU-MIA': 2800, 'GRU-JFK': 3400, 'GRU-LAX': 3900, 'GRU-MCO': 2600,
  'GRU-LIS': 3800, 'GRU-MAD': 3600, 'GRU-CDG': 4200, 'GRU-LHR': 4800,
  'GRU-FRA': 4500, 'GRU-AMS': 4300, 'GRU-FCO': 4100,
  'GRU-SCL': 1100, 'GRU-EZE': 900,  'GRU-BOG': 1800, 'GRU-LIM': 1600,
  'GRU-DXB': 5200, 'GRU-DOH': 5000, 'GRU-NRT': 6200,
  'CGH-BSB': 520,  'CGH-SSA': 680,  'CGH-REC': 800,  'CGH-GIG': 340,
  'GIG-BSB': 560,  'GIG-SSA': 640,  'GIG-REC': 760,  'GIG-FOR': 900,
  'BSB-SSA': 480,  'BSB-REC': 650,  'BSB-FOR': 720,  'BSB-MAO': 750,
  'SSA-REC': 380,  'SSA-FOR': 450,  'SSA-MCZ': 320,
  'POA-GRU': 490,  'POA-GIG': 550,  'POA-BSB': 620,
  'CWB-GRU': 380,  'CWB-GIG': 430,  'FLN-GRU': 410,
};

function getAvgPrice(origin: string, dest: string): number {
  return ROUTE_AVGS[`${origin}-${dest}`] ?? ROUTE_AVGS[`${dest}-${origin}`] ?? 1500;
}

function airlineInfo(iata: string) {
  return { iata, name: AIRLINE_NAMES[iata] ?? iata, color: AIRLINE_COLORS[iata] ?? '#64748b' };
}

function buildDecolarLink(origin: string, dest: string, date: string, returnDate?: string): string {
  if (returnDate) {
    return `https://www.decolar.com/shop/flights/results/roundtrip/${origin}/${dest}/${date}/${returnDate}/1/0/0`;
  }
  return `https://www.decolar.com/shop/flights/results/oneway/${origin}/${dest}/${date}/1/0/0`;
}

function ap(iata: string, name?: string) {
  return getAirport(iata) ?? { iata, name: name ?? iata, city: iata, country: '', flag: '🌍' };
}

// ─── SerpAPI types ────────────────────────────────────────────────────────────

interface SerpLeg {
  departure_airport: { id: string; name: string; time: string };
  arrival_airport:   { id: string; name: string; time: string };
  duration: number;  // minutes
  airline: string;
  airline_logo?: string;
  flight_number: string;
}

interface SerpOption {
  flights: SerpLeg[];
  layovers?: unknown[];
  total_duration: number; // minutes
  price: number;
  type?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Convert SerpAPI time string "2025-06-15 10:30" → ISO string
function toIso(timeStr: string): string {
  return new Date(timeStr.replace(' ', 'T') + ':00Z').toISOString();
}

// Extract airline IATA from flight_number like "G3 1547" → "G3"
function iataFromFlightNum(flightNumber: string): string {
  return flightNumber.trim().split(/\s+/)[0] || 'XX';
}

function buildSegment(legs: SerpLeg[], totalDurationMin: number): FlightSegment {
  const first = legs[0];
  const last  = legs[legs.length - 1];
  const iata  = iataFromFlightNum(first.flight_number);

  return {
    origin:          ap(first.departure_airport.id, first.departure_airport.name),
    destination:     ap(last.arrival_airport.id,    last.arrival_airport.name),
    departureTime:   toIso(first.departure_airport.time),
    arrivalTime:     toIso(last.arrival_airport.time),
    durationMinutes: totalDurationMin,
    stops:           Math.max(0, legs.length - 1),
    stopDetails:     [],
    airline:         airlineInfo(iata),
    flightNumber:    first.flight_number.replace(/\s+/, ''),
  };
}

// Splits a round-trip legs array into [outboundLegs, returnLegs]
function splitRoundTrip(legs: SerpLeg[], destination: string): [SerpLeg[], SerpLeg[]] {
  const splitAt = legs.findIndex(l => l.arrival_airport.id === destination);
  if (splitAt < 0) return [legs, []];
  return [legs.slice(0, splitAt + 1), legs.slice(splitAt + 1)];
}

// ─── Provider ────────────────────────────────────────────────────────────────

export const serpapiProvider: FlightProvider = {
  name: 'Google Flights',

  async searchFlights(params: SearchParams): Promise<Flight[]> {
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) return [];

    const { origin, destination, departureDate, returnDate } = params;
    const isRoundTrip = !!returnDate;
    const avgPrice    = getAvgPrice(origin, destination) * (isRoundTrip ? 1.85 : 1);

    const qs = new URLSearchParams({
      engine:        'google_flights',
      departure_id:  origin,
      arrival_id:    destination,
      outbound_date: departureDate,
      currency:      'BRL',
      hl:            'pt',
      type:          isRoundTrip ? '1' : '2',
      api_key:       apiKey,
    });
    if (isRoundTrip && returnDate) qs.set('return_date', returnDate);

    try {
      const res = await fetch(`${API_BASE}?${qs}`, { next: { revalidate: 300 } });
      if (!res.ok) {
        console.error(`SerpAPI ${res.status}:`, await res.text());
        return [];
      }

      const json = await res.json();

      // Combine best + other flights, filter valid options
      const options: SerpOption[] = [
        ...(Array.isArray(json.best_flights)  ? json.best_flights  : []),
        ...(Array.isArray(json.other_flights) ? json.other_flights : []),
      ].filter(o => o.price > 0 && Array.isArray(o.flights) && o.flights.length > 0);

      if (options.length === 0) return [];

      return options.map((option): Flight => {
        let outbound: FlightSegment;
        let inbound: FlightSegment | undefined;

        if (isRoundTrip) {
          const [outLegs, retLegs] = splitRoundTrip(option.flights, destination);
          const outDuration = outLegs.reduce((s, l) => s + l.duration, 0);
          const retDuration = retLegs.reduce((s, l) => s + l.duration, 0);
          outbound = buildSegment(outLegs, outDuration);
          inbound  = retLegs.length > 0 ? buildSegment(retLegs, retDuration) : undefined;
        } else {
          outbound = buildSegment(option.flights, option.total_duration);
        }

        const scored = scoreOpportunity(option.price, avgPrice);
        const link   = buildDecolarLink(origin, destination, departureDate, returnDate);

        return {
          id:           generateId(),
          outbound,
          inbound,
          price:        option.price,
          currency:     'BRL',
          link,
          provider:     'Google Flights',
          ...scored,
          averagePrice: Math.round(avgPrice),
          scrapedAt:    new Date().toISOString(),
        };
      });
    } catch (err) {
      console.error('SerpAPI provider error:', err);
      return [];
    }
  },
};
