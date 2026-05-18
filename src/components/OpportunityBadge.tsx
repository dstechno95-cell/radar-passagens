import { OpportunityLevel } from '@/lib/types';
import { getOpportunityConfig } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  level: OpportunityLevel;
  percentageVsAverage?: number;
  size?: 'sm' | 'md';
}

export function OpportunityBadge({ level, percentageVsAverage, size = 'md' }: Props) {
  const config = getOpportunityConfig(level);
  const isBelow = percentageVsAverage !== undefined && percentageVsAverage < 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.bgColor,
        config.borderColor,
        config.color,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
      )}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
      {isBelow && percentageVsAverage !== undefined && (
        <span className="opacity-75">
          ({Math.abs(percentageVsAverage)}% abaixo)
        </span>
      )}
    </span>
  );
}
