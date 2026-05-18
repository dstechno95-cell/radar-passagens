import type { Metadata } from 'next';
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
      <body>{children}</body>
    </html>
  );
}
