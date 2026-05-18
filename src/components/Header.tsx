'use client';

import Link from 'next/link';
import { Radar } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-dark-900/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-8 w-8 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-radar-500/20 group-hover:bg-radar-500/30 transition-colors" />
            <Radar className="relative h-5 w-5 text-radar-400" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">Radar</span>
            <span className="text-gradient"> Passagens</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-400 sm:flex">
          <Link href="/" className="hover:text-white transition-colors">
            Buscar
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            Alertas
          </Link>
          <Link
            href="#"
            className="rounded-full bg-radar-500/10 border border-radar-500/30 px-4 py-1.5 text-radar-400 hover:bg-radar-500/20 transition-all"
          >
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
