import { Flight, FlightProvider, SearchParams } from '@/lib/types';

export const skyscannerProvider: FlightProvider = {
  name: 'Skyscanner',

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async searchFlights(_params: SearchParams): Promise<Flight[]> {
    if (!process.env.SKYSCANNER_API_KEY) {
      return [];
    }
    // TODO: integrate Skyscanner Flights Live Prices API
    // POST https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/create
    throw new Error('Skyscanner integration not yet implemented');
  },
};
