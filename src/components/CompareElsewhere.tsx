'use client';

import { ExternalLink } from 'lucide-react';

interface Props {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
}

interface Site {
  id: string;
  name: string;
  description: string;
  buildUrl: (o: string, d: string, dep: string, ret?: string) => string;
}

const LOMADEE_ID = process.env.NEXT_PUBLIC_LOMADEE_ID || '';

function lomadeeWrap(url: string): string {
  if (!LOMADEE_ID) return url;
  return `https://www.lomadee.com/tracking?aid=${LOMADEE_ID}&type=8&url=${encodeURIComponent(url)}`;
}

const SITES: Site[] = [
  {
    id: 'decolar',
    name: 'Decolar',
    description: 'Maior OTA da América Latina',
    buildUrl: (o, d, dep, ret) => {
      const base = ret
        ? `https://www.decolar.com/shop/flights/results/roundtrip/${o}/${d}/${dep}/${ret}/1/0/0`
        : `https://www.decolar.com/shop/flights/results/oneway/${o}/${d}/${dep}/1/0/0`;
      return lomadeeWrap(base);
    },
  },
  {
    id: 'kayak',
    name: 'Kayak',
    description: 'Comparador global de voos',
    buildUrl: (o, d, dep, ret) =>
      ret
        ? `https://www.kayak.com.br/flights/${o}-${d}/${dep}/${ret}`
        : `https://www.kayak.com.br/flights/${o}-${d}/${dep}`,
  },
  {
    id: '123milhas',
    name: '123Milhas',
    description: 'Passagens e pacotes',
    buildUrl: (o, d, dep, ret) =>
      ret
        ? `https://123milhas.com/passagens-aereas/${o.toLowerCase()}-${d.toLowerCase()}/${dep}/${ret}`
        : `https://123milhas.com/passagens-aereas/${o.toLowerCase()}-${d.toLowerCase()}/${dep}`,
  },
  {
    id: 'maxmilhas',
    name: 'MaxMilhas',
    description: 'Voos com milhas aéreas',
    buildUrl: (o, d, dep) =>
      `https://maxmilhas.com.br/comprar-passagens/${o}/${d}?departureDate=${dep}&adults=1`,
  },
  // Afiliados Lomadee ativos
  {
    id: 'deonibus',
    name: 'DeÔnibus',
    description: 'Alternativa de ônibus — 5 mil destinos',
    buildUrl: () => 'https://lmdee.link/agJzY5zetElf',
  },
  {
    id: 'zupper',
    name: 'Zupper',
    description: 'Pacotes e viagens completas',
    buildUrl: () => 'https://lmdee.link/jgRh1QEYisH-',
  },
];

export function CompareElsewhere({ origin, destination, departureDate, returnDate }: Props) {
  return (
    <div className="rounded-2xl border border-white/7 bg-dark-800 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Comparar em outros sites
      </p>
      <div className="space-y-2">
        {SITES.map((site) => (
          <a
            key={site.id}
            href={site.buildUrl(origin, destination, departureDate, returnDate)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 hover:bg-white/8 transition-all group"
          >
            <div>
              <p className="text-sm font-semibold text-white">{site.name}</p>
              <p className="text-xs text-slate-500">{site.description}</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0" />
          </a>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-slate-700 text-center">
        Radar Passagens pode receber comissão por cliques
      </p>
    </div>
  );
}
