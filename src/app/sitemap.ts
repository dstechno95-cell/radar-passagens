import type { MetadataRoute } from 'next';

const APP = process.env.NEXT_PUBLIC_APP_URL || 'https://radar-passagens.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: APP,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${APP}/busca`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];
}
