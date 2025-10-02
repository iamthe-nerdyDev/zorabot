import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Props {
  totalYesShares: string;
  totalNoShares: string;
  className?: string;
}

export function MarketProgress({ totalNoShares, totalYesShares, className }: Props) {
  const totalShares = Number(totalNoShares) + Number(totalYesShares);
  const yesPercentage = totalShares > 0 ? (Number(totalYesShares) / totalShares) * 100 : 50;

  return (
    <div className={cn('mb-4', className)}>
      <div className="flex justify-between mb-1.5">
        <span className="text-green-300 font-semibold">
          <span className="text-sm">Yes&nbsp;</span>
          <span className="text-xs">{Math.floor(yesPercentage)}%</span>
        </span>
        <span className="text-primary/50 font-semibold">
          <span className="text-sm">No&nbsp;</span>
          <span className="text-xs">{Math.floor(100 - yesPercentage)}%</span>
        </span>
      </div>
      <Progress value={Math.floor(yesPercentage)} className="h-1.5" />
    </div>
  );
}
