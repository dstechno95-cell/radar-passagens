import { Radar } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2 text-slate-500">
            <Radar className="h-4 w-4 text-radar-500" />
            <span className="text-sm font-semibold text-slate-400">Radar Passagens</span>
          </div>
          <p className="text-xs text-slate-600">
            Agregador de oportunidades — não vendemos passagens diretamente.
          </p>
          <p className="text-xs text-slate-600">© 2025 Radar Passagens</p>
        </div>
      </div>
    </footer>
  );
}
