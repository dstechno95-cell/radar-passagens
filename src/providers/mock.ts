import { Flight, FlightProvider, FlightSegment, SearchParams } from '@/lib/types';
import { getAirport } from '@/lib/airports';
import { generateId } from '@/lib/utils';
import { scoreOpportunity } from '@/services/opportunityScorer';

const AIRLINES = [
  { iata: 'LA', name: 'LATAM Airlines', color: '#E31837' },
  { iata: 'G3', name: 'GOL Linhas Aéreas', color: '#FF6600' },
  { iata: 'AD', name: 'Azul Linhas Aéreas', color: '#004B87' },
  { iata: 'AA', name: 'American Airlines', color: '#0078D2' },
  { iata: 'CM', name: 'Copa Airlines', color: '#002B7F' },
  { iata: 'TP', name: 'TAP Air Portugal', color: '#006437' },
  { iata: 'IB', name: 'Iberia', color: '#C8102E' },
  { iata: 'AF', name: 'Air France', color: '#002157' },
  { iata: 'EK', name: 'Emirates', color: '#C41A23' },
  { iata: 'LH', name: 'Lufthansa', color: '#05164D' },
];

interface RouteConfig {
  avgPrice: number;
  durationMinutes: number;
  commonStops: number;
  airlines: string[];
}

const ROUTE_CONFIGS: Record<string, RouteConfig> = {
  'GRU-SDU': { avgPrice: 420, durationMinutes: 75, commonStops: 0, airlines: ['LA', 'G3', 'AD'] },
  'GRU-CGH': { avgPrice: 350, durationMinutes: 60, commonStops: 0, airlines: ['LA', 'G3', 'AD'] },
  'CGH-SDU': { avgPrice: 380, durationMinutes: 65, commonStops: 0, airlines: ['LA', 'G3', 'AD'] },
  'GRU-BSB': { avgPrice: 580, durationMinutes: 95, commonStops: 0, airlines: ['LA', 'G3', 'AD'] },
  'GRU-SSA': { avgPrice: 720, durationMinutes: 140, commonStops: 0, airlines: ['LA', 'G3', 'AD'] },
  'GRU-REC': { avgPrice: 850, durationMinutes: 165, commonStops: 0, airlines: ['LA', 'G3', 'AD'] },
  'GRU-FOR': { avgPrice: 980, durationMinutes: 200, commonStops: 0, airlines: ['LA', 'G3'] },
  'GRU-MCZ': { avgPrice: 890, durationMinutes: 175, commonStops: 0, airlines: ['LA', 'G3'] },
  'GRU-NAT': { avgPrice: 920, durationMinutes: 185, commonStops: 0, airlines: ['LA', 'G3'] },
  'GRU-MAO': { avgPrice: 860, durationMinutes: 210, commonStops: 0, airlines: ['LA', 'G3', 'AD'] },
  'GRU-BEL': { avgPrice: 780, durationMinutes: 195, commonStops: 0, airlines: ['LA', 'G3', 'AD'] },
  'GRU-CWB': { avgPrice: 380, durationMinutes: 60, commonStops: 0, airlines: ['LA', 'G3', 'AD'] },
  'GRU-POA': { avgPrice: 490, durationMinutes: 95, commonStops: 0, airlines: ['LA', 'G3', 'AD'] },
  'GRU-FLN': { avgPrice: 410, durationMinutes: 80, commonStops: 0, airlines: ['LA', 'G3', 'AD'] },
  'GRU-VIX': { avgPrice: 450, durationMinutes: 75, commonStops: 0, airlines: ['LA', 'G3', 'AD'] },
  'GRU-GYN': { avgPrice: 480, durationMinutes: 80, commonStops: 0, airlines: ['LA', 'G3'] },
  'GRU-MIA': { avgPrice: 2800, durationMinutes: 540, commonStops: 0, airlines: ['LA', 'AA', 'CM'] },
  'GRU-JFK': { avgPrice: 3400, durationMinutes: 600, commonStops: 0, airlines: ['LA', 'AA'] },
  'GRU-LAX': { avgPrice: 3900, durationMinutes: 720, commonStops: 1, airlines: ['LA', 'AA'] },
  'GRU-MCO': { avgPrice: 2600, durationMinutes: 510, commonStops: 0, airlines: ['LA', 'AA', 'CM'] },
  'GRU-LIS': { avgPrice: 3800, durationMinutes: 660, commonStops: 0, airlines: ['LA', 'TP', 'IB'] },
  'GRU-MAD': { avgPrice: 3600, durationMinutes: 660, commonStops: 0, airlines: ['LA', 'IB', 'AF'] },
  'GRU-CDG': { avgPrice: 4200, durationMinutes: 720, commonStops: 0, airlines: ['LA', 'AF'] },
  'GRU-FRA': { avgPrice: 4500, durationMinutes: 720, commonStops: 0, airlines: ['LA', 'LH'] },
  'GRU-LHR': { avgPrice: 4800, durationMinutes: 720, commonStops: 0, airlines: ['LA', 'AF'] },
  'GRU-SCL': { avgPrice: 1100, durationMinutes: 195, commonStops: 0, airlines: ['LA', 'G3'] },
  'GRU-EZE': { avgPrice: 900, durationMinutes: 165, commonStops: 0, airlines: ['LA', 'G3', 'AD'] },
  'GRU-BOG': { avgPrice: 1800, durationMinutes: 390, commonStops: 0, airlines: ['LA', 'CM'] },
  'GRU-LIM': { avgPrice: 1600, durationMinutes: 360, commonStops: 0, airlines: ['LA', 'CM'] },
  'GRU-DXB': { avgPrice: 5200, durationMinutes: 840, commonStops: 0, airlines: ['EK'] },
};

function getRouteKey(origin: string, dest: string): string {
  return `${origin}-${dest}`;
}

function getRouteConfig(origin: string, dest: string): RouteConfig {
  const key = getRouteKey(origin, dest);
  if (ROUTE_CONFIGS[key]) return ROUTE_CONFIGS[key];
  const reverseKey = getRouteKey(dest, origin);
  if (ROUTE_CONFIGS[reverseKey]) return ROUTE_CONFIGS[reverseKey];
  return { avgPrice: 1200, durationMinutes: 240, commonStops: 1, airlines: ['LA', 'G3', 'AD'] };
}

function addMinutes(base: Date, minutes: number): Date {
  return new Date(base.getTime() + minutes * 60000);
}

function generateSegment(
  originIata: string,
  destIata: string,
  departureBase: Date,
  config: RouteConfig,
  airlineIata: string
): FlightSegment {
  const airline = AIRLINES.find((a) => a.iata === airlineIata) || AIRLINES[0];
  const durationVariation = Math.round((Math.random() - 0.5) * 30);
  const duration = Math.max(60, config.durationMinutes + durationVariation);
  const stops = config.commonStops;

  const origin = getAirport(originIata) || {
    iata: originIata, name: originIata, city: originIata, country: 'Brasil', flag: '🇧🇷',
  };
  const destination = getAirport(destIata) || {
    iata: destIata, name: destIata, city: destIata, country: 'Brasil', flag: '🇧🇷',
  };

  return {
    origin,
    destination,
    departureTime: departureBase.toISOString(),
    arrivalTime: addMinutes(departureBase, duration).toISOString(),
    durationMinutes: duration,
    stops,
    stopDetails: [],
    airline,
    flightNumber: `${airlineIata}${Math.floor(Math.random() * 9000) + 1000}`,
  };
}

function buildSearchLink(origin: string, dest: string, departure: string, returnDate?: string): string {
  if (returnDate) {
    return `https://www.kayak.com.br/flights/${origin}-${dest}/${departure}/${returnDate}`;
  }
  return `https://www.kayak.com.br/flights/${origin}-${dest}/${departure}`;
}

function generateFlights(
  origin: string,
  destination: string,
  date: string,
  config: RouteConfig,
  count: number
): { segment: FlightSegment; price: number }[] {
  const results = [];
  const departureTimes = [6, 7, 8, 9, 10, 12, 14, 15, 16, 17, 18, 19, 20, 21];

  const shuffledTimes = departureTimes.sort(() => Math.random() - 0.5).slice(0, count);

  for (const hour of shuffledTimes) {
    const base = new Date(`${date}T${String(hour).padStart(2, '0')}:${Math.random() > 0.5 ? '30' : '00'}:00Z`);
    const airlineIata = config.airlines[Math.floor(Math.random() * config.airlines.length)];
    const segment = generateSegment(origin, destination, base, config, airlineIata);
    const priceVariation = 0.7 + Math.random() * 0.6;
    const price = Math.round(config.avgPrice * priceVariation / 10) * 10;
    results.push({ segment, price });
  }

  return results;
}

export const mockProvider: FlightProvider = {
  name: 'MockProvider',

  async searchFlights(params: SearchParams): Promise<Flight[]> {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

    const config = getRouteConfig(params.origin, params.destination);
    const outboundResults = generateFlights(params.origin, params.destination, params.departureDate, config, 6);

    const flights: Flight[] = outboundResults.map(({ segment, price }) => {
      let inbound: FlightSegment | undefined;
      let totalPrice = price;

      if (params.returnDate) {
        const returnConfig = getRouteConfig(params.destination, params.origin);
        const returnResults = generateFlights(
          params.destination, params.origin, params.returnDate, returnConfig, 1
        );
        if (returnResults.length > 0) {
          inbound = returnResults[0].segment;
          totalPrice = price + returnResults[0].price;
        }
      }

      const scored = scoreOpportunity(totalPrice, config.avgPrice * (params.returnDate ? 1.85 : 1));

      return {
        id: generateId(),
        outbound: segment,
        inbound,
        price: totalPrice,
        currency: 'BRL',
        link: buildSearchLink(params.origin, params.destination, params.departureDate, params.returnDate),
        provider: 'MockProvider',
        ...scored,
        averagePrice: Math.round(config.avgPrice * (params.returnDate ? 1.85 : 1)),
        scrapedAt: new Date().toISOString(),
      };
    });

    return flights.sort((a, b) => a.price - b.price);
  },
};
