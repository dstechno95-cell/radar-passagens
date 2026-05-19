import type { MetadataRoute } from 'next';

const APP = process.env.NEXT_PUBLIC_APP_URL || 'https://radar-passagens.vercel.app';

const POPULAR_ROUTES = [
  { origin: 'GRU', destination: 'SDU' },
  { origin: 'GRU', destination: 'SSA' },
  { origin: 'GRU', destination: 'REC' },
  { origin: 'GRU', destination: 'FOR' },
  { origin: 'GRU', destination: 'NAT' },
  { origin: 'GRU', destination: 'MCZ' },
  { origin: 'GRU', destination: 'POA' },
  { origin: 'GRU', destination: 'CWB' },
  { origin: 'GRU', destination: 'BSB' },
  { origin: 'GRU', destination: 'MAO' },
  { origin: 'GRU', destination: 'MIA' },
  { origin: 'GRU', destination: 'LIS' },
  { origin: 'GRU', destination: 'MAD' },
  { origin: 'GRU', destination: 'CDG' },
  { origin: 'GRU', destination: 'LHR' },
  { origin: 'CGH', destination: 'BSB' },
  { origin: 'CGH', destination: 'SSA' },
  { origin: 'CGH', destination: 'REC' },
  { origin: 'GIG', destination: 'BSB' },
  { origin: 'GIG', destination: 'FOR' },
  { origin: 'POA', destination: 'GRU' },
  { origin: 'BSB', destination: 'SSA' },
  { origin: 'SSA', destination: 'REC' },
];

function nextMonday(): string {
  const d = new Date();
  d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
  return d.toISOString().split('T')[0];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const departure = nextMonday();

  const routeUrls: MetadataRoute.Sitemap = POPULAR_ROUTES.map(({ origin, destination }) => ({
    url: `${APP}/busca?origin=${origin}&destination=${destination}&departure=${departure}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [
    {
      url: APP,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...routeUrls,
  ];
}
