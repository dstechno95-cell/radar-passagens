import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

const APP = process.env.NEXT_PUBLIC_APP_URL || 'https://radar-passagens.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP),
  title: {
    default: 'Radar Passagens — Promoções de Passagens Aéreas',
    template: '%s | Radar Passagens',
  },
  description:
    'Encontre as melhores promoções de passagens aéreas no Brasil e internacional. Comparamos preços em tempo real e mostramos as melhores oportunidades de voo.',
  keywords: ['passagens aéreas', 'promoções voos', 'radar passagens', 'passagem barata', 'voos baratos', 'comparar passagens'],
  authors: [{ name: 'Radar Passagens' }],
  creator: 'Radar Passagens',
  openGraph: {
    title: 'Radar Passagens — Promoções de Passagens Aéreas',
    description: 'Compare preços e encontre as melhores promoções de voos em tempo real.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Radar Passagens',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radar Passagens',
    description: 'Compare preços e encontre as melhores promoções de voos em tempo real.',
  },
  robots: { index: true, follow: true },
  other: {
    'lomadee': '2324685',
    'impact-site-verification': '4edeef75-288f-4c94-9727-f5e836577389',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <meta name="impact-site-verification" {...{ value: '4edeef75-288f-4c94-9727-f5e836577389' } as any} />
      </head>
      <body>
        {children}
        <Script
          id="impact-tracking"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('https://utt.impactcdn.com/P-A7320323-accf-4d88-947e-c864d76086041.js','script','impactStat',document,window);impactStat('transformLinks');impactStat('trackImpression');`,
          }}
        />
      </body>
    </html>
  );
}
