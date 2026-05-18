import { Flight, FlightProvider, FlightSegment, SearchParams } from '@/lib/types';
import { getAirport } from '@/lib/airports';
import { scoreOpportunity } from '@/services/opportunityScorer';
import { generateId } from '@/lib/utils';

const API_BASE     = 'https://tequila.kiwi.com/v2/search';
const AFFILIATE_ID = process.env.KIWI_AFFILIATE_ID || '';

const AIRLINE_NAMES: Record<string, string> = {
  G3: 'GOL Linhas Aéreas',    LA: 'LATAM Airlines',        JJ: 'LATAM Brasil',
  AD: 'Azul Linhas Aéreas',   AA: 'American Airlines',     CM: 'Copa Airlines',
  TP: 'TAP Air Portugal',     IB: 'Iberia',                AF: 'Air France',
  EK: 'Emirates',             LH: 'Lufthansa',             KL: 'KLM',
  QR: 'Qatar Airways',        UA: 'United Airlines',       DL: 'Delta Air Lines',
  TK: 'Turkish Airlines',     '2Z': 'Passaredo',           AV: 'Avianca',
  AM: 'Aeroméxico',           H2: 'Sky Airline',           BA: 'British Airways',
  LX: 'SWISS',                AR: 'Aerolíneas Argentinas', AZ: 'ITA Airways',
  OS: 'Austrian Airlines',    SK: 'SAS',                   B6: 'JetBlue',
  F9: 'Frontier Airlines',    NK: 'Spirit Airlines',       WN: 'Southwest Airlines',
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

function toKiwiDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function buildLink(deepLink: string): string {
  if (!deepLink) return '#';
  try {
    const url = new URL(deepLink);
    if (AFFILIATE_ID) url.searchParams.set('affilid', AFFILIATE_ID);
    return url.toString();
  } catch {
    return deepLink;
  }
}

function ap(iata: string) {
  return getAirport(iata) ?? { iata, name: iata, city: iata, country: '', flag: '🌍' };
}

// ─── Kiwi API types ───────────────────────────────────────────────────────────

interface KiwiLeg {
  flyFrom: string;
  flyTo: string;
  local_departure: string;
  local_arrival: string;
  airline: string;
  flight_no: number;
}

interface KiwiTicket {
  flyFrom: string;
  flyTo: string;
  local_departure: string;
  local_arrival: string;
  duration: { departure: number; return: number }; // seconds
  price: number;
  airlines: string[];
  route: KiwiLeg[];
  deep_link: string;
  transfers: number;
}

// ─── Segment extraction ───────────────────────────────────────────────────────

function outboundSeg(ticket: KiwiTicket): FlightSegment {
  const legs        = ticket.route;
  const returnStart = legs.findIndex(l => l.flyFrom === ticket.flyTo);
  const outLegs     = returnStart >= 0 ? legs.slice(0, returnStart) : legs;
  const first = outLegs[0] ?? legs[0];
  const last  = outLegs[outLegs.length - 1] ?? first;

  return {
    origin:          ap(ticket.flyFrom),
    destination:     ap(ticket.flyTo),
    departureTime:   new Date(first.local_departure).toISOString(),
    arrivalTime:     new Date(last.local_arrival).toISOString(),
    durationMinutes: Math.round(ticket.duration.departure / 60),
    stops:           Math.max(0, outLegs.length - 1),
    stopDetails:     [],
    airline:         airlineInfo(first.airline),
    flightNumber:    `${first.airline}${first.flight_no}`,
  };
}

function inboundSeg(ticket: KiwiTicket): FlightSegment | undefined {
  if (!ticket.duration.return) return undefined;
  const legs        = ticket.route;
  const returnStart = legs.findIndex(l => l.flyFrom === ticket.flyTo);
  if (returnStart < 0) return undefined;

  const retLegs = legs.slice(returnStart);
  const first   = retLegs[0];
  const last    = retLegs[retLegs.length - 1];

  return {
    origin:          ap(ticket.flyTo),
    destination:     ap(ticket.flyFrom),
    departureTime:   new Date(first.local_departure).toISOString(),
    arrivalTime:     new Date(last.local_arrival).toISOString(),
    durationMinutes: Math.round(ticket.duration.return / 60),
    stops:           Math.max(0, retLegs.length - 1),
    stopDetails:     [],
    airline:         airlineInfo(first.airline),
    flightNumber:    `${first.airline}${first.flight_no}`,
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export const kiwiProvider: FlightProvider = {
  name: 'Kiwi',

  async searchFlights(params: SearchParams): Promise<Flight[]> {
    const apiKey = process.env.KIWI_API_KEY;
    if (!apiKey) return [];

    const { origin, destination, departureDate, returnDate } = params;
    const isRoundTrip = !!returnDate;
    const avgPrice    = getAvgPrice(origin, destination) * (isRoundTrip ? 1.85 : 1);

    const qs = new URLSearchParams({
      fly_from:      origin,
      fly_to:        destination,
      date_from:     toKiwiDate(departureDate),
      date_to:       toKiwiDate(departureDate),
      curr:          'BRL',
      locale:        'pt',
      adults:        String(params.adults || 1),
      sort:          'price',
      limit:         '10',
      max_stopovers: '2',
    });

    if (isRoundTrip && returnDate) {
      qs.set('return_from', toKiwiDate(returnDate));
      qs.set('return_to',   toKiwiDate(returnDate));
    }

    try {
      const res = await fetch(`${API_BASE}?${qs}`, {
        headers: { apikey: apiKey },
        next: { revalidate: 300 },
      });

      if (!res.ok) {
        console.error(`Kiwi API ${res.status}:`, await res.text());
        return [];
      }

      const json = await res.json();
      if (!Array.isArray(json.data) || json.data.length === 0) return [];

      return (json.data as KiwiTicket[]).map((ticket): Flight => {
        const outbound = outboundSeg(ticket);
        const inbound  = isRoundTrip ? inboundSeg(ticket) : undefined;
        const scored   = scoreOpportunity(ticket.price, avgPrice);

        return {
          id:           generateId(),
          outbound,
          inbound,
          price:        ticket.price,
          currency:     'BRL',
          link:         buildLink(ticket.deep_link),
          provider:     'Kiwi',
          ...scored,
          averagePrice: Math.round(avgPrice),
          scrapedAt:    new Date().toISOString(),
        };
      });
    } catch (err) {
      console.error('Kiwi provider error:', err);
      return [];
    }
  },
};
