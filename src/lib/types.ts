export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
  flag: string;
}

export interface Airline {
  iata: string;
  name: string;
  color: string;
}

export interface StopDetail {
  airport: Airport;
  durationMinutes: number;
}

export interface FlightSegment {
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  stopDetails: StopDetail[];
  airline: Airline;
  flightNumber: string;
}

export type OpportunityLevel = 'excellent' | 'good' | 'normal' | 'expensive';

export interface Flight {
  id: string;
  outbound: FlightSegment;
  inbound?: FlightSegment;
  price: number;
  currency: string;
  link: string;
  provider: string;
  opportunity: OpportunityLevel;
  opportunityScore: number;
  percentageVsAverage: number;
  averagePrice: number;
  scrapedAt: string;
}

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
}

export interface SearchResult {
  flights: Flight[];
  totalFound: number;
  searchId: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  bestOpportunity: OpportunityLevel;
  searchedAt: string;
}

export interface FlightProvider {
  readonly name: string;
  searchFlights(params: SearchParams): Promise<Flight[]>;
}

export interface OpportunityConfig {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  description: string;
}
