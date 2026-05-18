import Link from 'next/link';
import { SearchX, Calendar, ArrowLeftRight } from 'lucide-react';

interface Props {
  origin: string;
  destination: string;
  departure?: string;
}

export function NoResults({ origin, destination, departure }: Props) {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/7 bg-dark-800 py-12 px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
          <SearchX className="h-8 w-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Nenhuma oferta encontrada
        </h3>
        <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
          Não encontramos voos disponíveis para{' '}
          <strong className="text-white">{origin} → {destination}</strong>{' '}
          nesta data. Tente datas diferentes ou outra combinação de aeroportos.
        </p>

        {/* Sugestões de datas */}
        <div className="w-full max-w-sm space-y-2 mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-3">
            <Calendar className="inline h-3 w-3 mr-1" />
            Tentar outras datas
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Amanhã', date: tomorrow },
              { label: 'Próxima semana', date: nextWeek },
              { label: 'Próximo mês', date: nextMonth },
            ].map(({ label, date }) => (
              <Link
                key={date}
                href={`/busca?origin=${origin}&destination=${destination}&departure=${date}`}
                className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-all text-center"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Inverter rota */}
        <Link
          href={`/busca?origin=${destination}&destination=${origin}&departure=${departure || tomorrow}`}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Tentar {destination} → {origin}
        </Link>

        <Link
          href="/"
          className="rounded-xl bg-radar-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-radar-600 transition-colors"
        >
          Nova busca
        </Link>
      </div>
    </div>
  );
}
