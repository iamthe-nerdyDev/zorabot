'use client';

import { formatNumber, toNumber } from '@/lib/helpers';
import React from 'react';
import { Button } from '../ui/button';
import { IconAward } from '@tabler/icons-react';
import type { CustomPriceMarket } from '@/types';
import { calculatePotentialWin } from './UserMarketHoldings';

interface Props {
  market: CustomPriceMarket;
}

export function MarketResolved({ market }: Props) {
  const shares = React.useMemo(() => market.shares ?? [], [market]);
  const yesAmount = shares
    .filter((s) => s.isYes)
    .reduce((acc, curr) => acc + toNumber(curr.amount, market.bettingToken.decimals), 0);
  const noAmount = shares
    .filter((s) => !s.isYes)
    .reduce((acc, curr) => acc + toNumber(curr.amount, market.bettingToken.decimals), 0);

  const claimAmount = React.useMemo(() => {
    if (!market.resolved) return null;
    if (market.outcome === 'NO') return calculatePotentialWin('No', noAmount, market);
    if (market.outcome === 'YES') return calculatePotentialWin('Yes', yesAmount, market);
    return 0;
  }, [market, yesAmount, noAmount]);

  const hasClaimed = (market.claims || []).length > 0;

  return !claimAmount ? null : (
    <Button
      onClick={() => {}}
      disabled={hasClaimed}
      variant="default"
      className="w-full h-10.5 gap-1 bg-violet-500 text-white hover:bg-violet-600 mt-2"
    >
      <IconAward className="size-4.5 opacity-100" />
      <span>
        {hasClaimed ? 'Claimed' : 'Claim'}&nbsp;
        <span className="font-medium">
          {formatNumber(claimAmount)} {market.bettingToken.symbol}
        </span>
      </span>
    </Button>
  );
}
