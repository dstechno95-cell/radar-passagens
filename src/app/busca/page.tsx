import type { Metadata } from 'next';
import { getAirport } from '@/lib/airports';
import { BuscaPage } from './SearchPage';

interface Props {
  searchParams: { origin?: string; destination?: string; departure?: string; return?: string };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { origin, destination } = searchParams;
  const originAp = origin ? getAirport(origin) : null;
  const destAp   = destination ? getAirport(destination) : null;

  if (!origin || !destination) {
    return {
      title: 'Busca de Passagens | Radar Passagens',
      description: 'Compare passagens aéreas e encontre as melhores promoções em tempo real.',
    };
  }

  const originName = originAp?.city || origin;
  const destName   = destAp?.city   || destination;
  const flags      = `${originAp?.flag ?? '✈️'} ${destAp?.flag ?? '✈️'}`;

  return {
    title: `Passagens ${originName} → ${destName} | Radar Passagens`,
    description: `Compare preços de voos de ${originName} para ${destName}. Veja promoções e oportunidades em tempo real — encontre a passagem mais barata agora.`,
    keywords: [
      `passagens ${originName} ${destName}`,
      `voos baratos ${originName}`,
      `promoção ${originName} para ${destName}`,
      'passagens aéreas baratas',
      'radar passagens',
    ],
    openGraph: {
      title: `${flags} ${originName} → ${destName} | Radar Passagens`,
      description: `Passagens de ${originName} para ${destName} com as melhores promoções do mercado.`,
      type: 'website',
    },
  };
}

export default function Page({ searchParams }: Props) {
  return <BuscaPage />;
}
