import { Metadata } from 'next';
import { Radar, TrendingDown, Zap, Shield } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchForm } from '@/components/SearchForm';

export const metadata: Metadata = {
  title: 'Radar Passagens — Promoções de Passagens Aéreas',
  description:
    'Encontre as melhores promoções de passagens aéreas. Comparamos preços em tempo real e mostramos as melhores oportunidades para você.',
};

const POPULAR_ROUTES = [
  { from: 'GRU', fromCity: 'São Paulo', to: 'SDU', toCity: 'Rio de Janeiro', flag: '🇧🇷' },
  { from: 'GRU', fromCity: 'São Paulo', to: 'SSA', toCity: 'Salvador', flag: '🇧🇷' },
  { from: 'GRU', fromCity: 'São Paulo', to: 'REC', toCity: 'Recife', flag: '🇧🇷' },
  { from: 'GRU', fromCity: 'São Paulo', to: 'FOR', toCity: 'Fortaleza', flag: '🇧🇷' },
  { from: 'GRU', fromCity: 'São Paulo', to: 'MIA', toCity: 'Miami', flag: '🇺🇸' },
  { from: 'GRU', fromCity: 'São Paulo', to: 'LIS', toCity: 'Lisboa', flag: '🇵🇹' },
];

const FEATURES = [
  {
    icon: TrendingDown,
    title: 'Detecção automática',
    desc: 'Identificamos promoções comparando com a média histórica da rota.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: Zap,
    title: 'Resultados em segundos',
    desc: 'Buscamos em múltiplas fontes simultaneamente para dar a resposta mais rápida.',
    color: 'text-radar-400',
    bg: 'bg-radar-500/10',
  },
  {
    icon: Shield,
    title: 'Só oportunidades reais',
    desc: 'Nosso score de oportunidade filtra o joio do trigo. Você vê o que vale a pena.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Radar Passagens',
  description: 'Compare preços de passagens aéreas e encontre as melhores promoções em tempo real.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://radar-passagens.vercel.app',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'https://radar-passagens.vercel.app'}/busca?origin={origin}&destination={destination}&departure={departure}`,
    },
    'query-input': 'required name=origin required name=destination required name=departure',
  },
};

export default function HomePage() {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden pb-20 pt-16 sm:pt-24">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-radial from-radar-500/8 via-transparent to-transparent" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Radar rings */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="radar-ping absolute h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-radar-500/20" />
            <div className="radar-ping-delay absolute h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-radar-500/10" />
          </div>

          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-radar-500/30 bg-radar-500/10 px-4 py-1.5 text-sm text-radar-400">
              <Radar className="h-3.5 w-3.5" />
              <span>Radar de promoções aéreas</span>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Encontre passagens{' '}
              <span className="text-gradient">em promoção</span>
            </h1>
            <p className="mb-10 text-base text-slate-400 sm:text-lg max-w-xl mx-auto">
              Monitoramos preços em tempo real e avisamos quando surgem as melhores oportunidades de voo.
            </p>

            {/* Search card */}
            <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-dark-800/80 p-5 shadow-2xl shadow-black/50 backdrop-blur-sm">
              <SearchForm />
            </div>

            {/* Popular routes */}
            <div className="mt-8">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-500">
                Rotas populares
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_ROUTES.map((route) => (
                  <a
                    key={`${route.from}-${route.to}`}
                    href={`/busca?origin=${route.from}&destination=${route.to}&departure=${tomorrow}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition-all hover:border-white/20 hover:bg-white/8 hover:text-white"
                  >
                    <span>{route.flag}</span>
                    <span>{route.fromCity} → {route.toCity}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-white/5 py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="mb-10 text-center text-xl font-bold text-white">
              Como funciona o radar
            </h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {FEATURES.map((feat) => (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-white/7 bg-dark-800 p-5"
                >
                  <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${feat.bg}`}>
                    <feat.icon className={`h-5 w-5 ${feat.color}`} />
                  </div>
                  <h3 className="mb-1.5 font-semibold text-white">{feat.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Opportunity legend */}
        <section className="pb-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-2xl border border-white/7 bg-dark-800 p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-300">
                Como interpretamos os preços
              </h3>
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { emoji: '🔥', label: 'Promoção', desc: '30%+ abaixo da média', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
                  { emoji: '✅', label: 'Bom preço', desc: '15–30% abaixo da média', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                  { emoji: '⚠️', label: 'Preço normal', desc: 'Na média histórica', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                  { emoji: '❌', label: 'Preço alto', desc: 'Acima da média', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
                ].map((item) => (
                  <div key={item.label} className={`rounded-xl border ${item.border} ${item.bg} p-3`}>
                    <p className="text-xl mb-1">{item.emoji}</p>
                    <p className={`text-sm font-semibold ${item.color}`}>{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
