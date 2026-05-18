import { NextRequest, NextResponse } from 'next/server';
import { searchFlights } from '@/services/flightService';
import { saveSearchToDb } from '@/services/priceHistory';
import { SearchParams } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departure');
  const returnDate = searchParams.get('return') || undefined;

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { error: 'Parâmetros obrigatórios: origin, destination, departure' },
      { status: 400 }
    );
  }

  if (origin.length !== 3 || destination.length !== 3) {
    return NextResponse.json(
      { error: 'Códigos IATA inválidos (deve ter 3 letras)' },
      { status: 400 }
    );
  }

  const params: SearchParams = {
    origin: origin.toUpperCase(),
    destination: destination.toUpperCase(),
    departureDate,
    returnDate,
    adults: Number(searchParams.get('adults')) || 1,
    cabinClass: (searchParams.get('cabin') as SearchParams['cabinClass']) || 'economy',
  };

  try {
    const result = await searchFlights(params);

    // Salva no banco (await — serverless precisa completar antes do response)
    if (result.flights.length > 0) {
      try {
        await saveSearchToDb(
          result.searchId,
          params.origin,
          params.destination,
          params.departureDate,
          params.returnDate,
          result.flights
        );
      } catch {
        // Falha silenciosa — não bloqueia a resposta ao usuário
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Flight search error:', err);
    return NextResponse.json({ error: 'Erro interno na busca' }, { status: 500 });
  }
}
