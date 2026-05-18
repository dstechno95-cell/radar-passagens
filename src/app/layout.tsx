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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="lomadee" content="2324685" />
        <meta name="impact-site-verification" value="4edeef75-288f-4c94-9727-f5e836577389" />
      </head>
      <body>{children}</body>
    </html>
  );
}
