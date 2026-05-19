import type { MetadataRoute } from 'next';

const APP = process.env.NEXT_PUBLIC_APP_URL || 'https://radar-passagens.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${APP}/sitemap.xml`,
  };
}
