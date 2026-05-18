import { TrendingDown, TrendingUp, Minus, BarChart2 } from 'lucide-react';
import { SearchResult } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface Props {
  result: SearchResult;
}

export function PriceComparator({ result }: Props) {
  const range = result.maxPrice - result.minPrice;
  const minPercent = 0;
  const avgPercent = range > 0 ? ((result.avgPrice - result.minPrice) / range) * 100 : 50;

  const savings = result.avgPrice - result.minPrice;
  const savingsPct = result.avgPrice > 0 ? Math.round((savings / result.avgPrice) * 100) : 0;

  return (
    <div className="rounded-2xl border border-white/7 bg-dark-800 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="h-4 w-4 text-radar-400" />
        <h3 className="text-sm font-semibold text-white">Comparativo de preços</h3>
      </div>

      {/* Price stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-center">
          <TrendingDown className="mx-auto mb-1 h-4 w-4 text-green-400" />
          <p className="text-xs text-slate-400 mb-0.5">Menor preço</p>
          <p className="text-base font-bold text-green-400">{formatPrice(result.minPrice)}</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <Minus className="mx-auto mb-1 h-4 w-4 text-slate-400" />
          <p className="text-xs text-slate-400 mb-0.5">Média</p>
          <p className="text-base font-bold text-white">{formatPrice(result.avgPrice)}</p>
        </div>
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-center">
          <TrendingUp className="mx-auto mb-1 h-4 w-4 text-red-400" />
          <p className="text-xs text-slate-400 mb-0.5">Maior preço</p>
          <p className="text-base font-bold text-red-400">{formatPrice(result.maxPrice)}</p>
        </div>
      </div>

      {/* Range bar */}
      <div className="space-y-2">
        <div className="relative h-2 rounded-full bg-white/8 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
            style={{ width: '100%' }}
          />
          {/* Min marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 w-1.5 rounded-full bg-white shadow-lg"
            style={{ left: `${minPercent}%` }}
          />
          {/* Avg marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 w-1.5 rounded-full bg-yellow-400 shadow-lg"
            style={{ left: `${avgPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Mais barato</span>
          <span>Média da rota</span>
          <span>Mais caro</span>
        </div>
      </div>

      {/* Insight */}
      {savingsPct > 10 && (
        <div className="mt-4 rounded-xl bg-green-500/10 border border-green-500/20 px-3 py-2.5">
          <p className="text-sm text-green-400">
            💡 A melhor oferta encontrada está{' '}
            <strong>{savingsPct}% abaixo</strong> da média desta rota.
          </p>
        </div>
      )}
    </div>
  );
}
