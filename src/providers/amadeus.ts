import { Flight, FlightProvider, SearchParams } from '@/lib/types';

export const amadeusProvider: FlightProvider = {
  name: 'Amadeus',

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async searchFlights(_params: SearchParams): Promise<Flight[]> {
    if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
      return [];
    }
    // TODO: integrate Amadeus Flight Offers Search API
    // GET https://api.amadeus.com/v2/shopping/flight-offers
    throw new Error('Amadeus integration not yet implemented');
  },
};
