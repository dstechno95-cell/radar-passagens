import { FlightProvider } from '@/lib/types';
import { mockProvider } from './mock';
import { travelpayoutsProvider } from './travelpayouts';
import { skyscannerProvider } from './skyscanner';
import { amadeusProvider } from './amadeus';
import { kiwiProvider } from './kiwi';
import { serpapiProvider } from './serpapi';

// Em produção: só dados reais. Em dev: mock como fallback.
const isDev = process.env.NODE_ENV !== 'production';

export const providers: FlightProvider[] = [
  travelpayoutsProvider,
  kiwiProvider,    // ativo quando KIWI_API_KEY estiver definida
  serpapiProvider, // ativo quando SERPAPI_KEY estiver definida
  ...(isDev ? [mockProvider] : []),
  // skyscannerProvider,
  // amadeusProvider,
];

export { mockProvider, travelpayoutsProvider, skyscannerProvider, amadeusProvider, kiwiProvider, serpapiProvider };
