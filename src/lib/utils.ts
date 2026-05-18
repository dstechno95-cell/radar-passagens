import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OpportunityConfig, OpportunityLevel } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  });
}

export function formatDateInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getOpportunityConfig(level: OpportunityLevel): OpportunityConfig {
  const configs: Record<OpportunityLevel, OpportunityConfig> = {
    excellent: {
      label: 'Promoção',
      emoji: '🔥',
      color: 'text-green-400',
      bgColor: 'bg-green-500/15',
      borderColor: 'border-green-500/30',
      dotColor: 'bg-green-400',
      description: 'Ótima oportunidade',
    },
    good: {
      label: 'Bom preço',
      emoji: '✅',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15',
      borderColor: 'border-emerald-500/30',
      dotColor: 'bg-emerald-400',
      description: 'Abaixo da média',
    },
    normal: {
      label: 'Preço normal',
      emoji: '⚠️',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/15',
      borderColor: 'border-yellow-500/30',
      dotColor: 'bg-yellow-400',
      description: 'Na média',
    },
    expensive: {
      label: 'Preço alto',
      emoji: '❌',
      color: 'text-red-400',
      bgColor: 'bg-red-500/15',
      borderColor: 'border-red-500/30',
      dotColor: 'bg-red-400',
      description: 'Acima da média',
    },
  };
  return configs[level];
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
