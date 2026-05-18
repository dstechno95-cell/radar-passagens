'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { Airport } from '@/lib/types';
import { searchAirports } from '@/lib/airports';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  placeholder: string;
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
}

export function AirportInput({ label, placeholder, value, onChange }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Airport[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(searchAirports(query));
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleSelect(airport: Airport) {
    onChange(airport);
    setQuery('');
    setOpen(false);
  }

  function handleClear() {
    onChange(null);
    setQuery('');
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-xs font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl border bg-white/5 px-3 py-3 transition-all',
          open ? 'border-radar-500/60 ring-2 ring-radar-500/20' : 'border-white/10 hover:border-white/20'
        )}
      >
        <MapPin className="h-4 w-4 flex-shrink-0 text-slate-500" />
        {value && !open ? (
          <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white">{value.flag} {value.iata}</span>
                <span className="text-sm text-slate-300 truncate">{value.city}</span>
              </div>
            </div>
            <button onClick={handleClear} className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-dark-700 shadow-2xl shadow-black/50">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">Nenhum aeroporto encontrado</p>
          ) : (
            <ul>
              {results.map((airport) => (
                <li key={airport.iata}>
                  <button
                    type="button"
                    onMouseDown={() => handleSelect(airport)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-xl">{airport.flag}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{airport.iata}</span>
                        <span className="truncate text-sm text-slate-300">{airport.city}</span>
                      </div>
                      <p className="truncate text-xs text-slate-500">{airport.name} · {airport.country}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
