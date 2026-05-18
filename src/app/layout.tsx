import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Radar Passagens — Promoções de Voos',
  description:
    'Encontre as melhores promoções de passagens aéreas no Brasil e internacional. Comparamos preços em tempo real e indicamos as melhores oportunidades.',
  keywords: ['passagens aéreas', 'promoções voos', 'radar passagens', 'comprar passagem barata'],
  openGraph: {
    title: 'Radar Passagens',
    description: 'Radar de promoções de passagens aéreas',
    type: 'website',
  },
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
