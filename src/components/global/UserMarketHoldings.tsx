'use client';

import { formatNumber, toNumber } from '@/lib/helpers';
import type { CustomPriceMarket } from '@/types';
import { IconTargetArrow } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { MarketPending } from './MarketPending';
import { MarketResolved } from './MarketResolved';
import React from 'react';

export function calculatePotentialWin(
  on: 'Yes' | 'No',
  amount: number,
  market: CustomPriceMarket,
  shouldAssume = false
) {
  const totalYesShares = toNumber(market.totalYesShares, market.bettingToken.decimals);
  const totalNoShares = toNumber(market.totalNoShares, market.bettingToken.decimals);

  const losingShares = on === 'Yes' ? totalNoShares : totalYesShares;
  const winningShares =
    (shouldAssume ? amount : 0) + (on === 'Yes' ? totalYesShares : totalNoShares);

  const ratio = losingShares / winningShares;
  return amount + amount * ratio;
}

export default function UserMarketHoldings({ market }: { market: CustomPriceMarket }) {
  const shares = React.useMemo(() => market.shares ?? [], [market]);
  const yesAmount = shares
    .filter((s) => s.isYes)
    .reduce((acc, curr) => acc + toNumber(curr.amount, market.bettingToken.decimals), 0);
  const noAmount = shares
    .filter((s) => !s.isYes)
    .reduce((acc, curr) => acc + toNumber(curr.amount, market.bettingToken.decimals), 0);

  return (
    <div className="p-3.5">
      <div className="mb-2.5">
        <h4 className="text-lg font-semibold flex items-center gap-1.5">
          <IconTargetArrow className="opacity-60 size-5" strokeWidth={1.5} />
          <span>Stakes</span>
        </h4>
      </div>

      <div className="flex flex-col gap-2">
        {yesAmount > 0 ? (
          <div className="w-full flex items-center gap-1.5">
            <p className="text-sm">
              {formatNumber(yesAmount)} {market.bettingToken.symbol} on&nbsp;
              <strong className="text-green-500">YES</strong>
            </p>
            <span
              className={cn('text-gray-400 text-xs', market.outcome === 'NO' && 'line-through')}
            >
              (<span className="font-medium">Pot. win</span>&nbsp;
              {formatNumber(calculatePotentialWin('Yes', yesAmount, market), false)}&nbsp;
              {market.bettingToken.symbol})
            </span>
          </div>
        ) : null}

        {noAmount > 0 ? (
          <div className="w-full flex items-center gap-1.5">
            <p className="text-sm">
              {formatNumber(noAmount)} {market.bettingToken.symbol} on&nbsp;
              <strong className="text-red-500">NO</strong>
            </p>
            <span
              className={cn('text-gray-400 text-xs', market.outcome === 'YES' && 'line-through')}
            >
              (<span className="font-medium">Pot. win</span>&nbsp;
              {formatNumber(calculatePotentialWin('No', noAmount, market), false)}&nbsp;
              {market.bettingToken.symbol})
            </span>
          </div>
        ) : null}
      </div>

      {new Date(market.endTs) < new Date() ? (
        <div className="mt-2.5">
          {market.resolved ? (
            <MarketResolved market={market} disableClick={false} />
          ) : (
            <MarketPending />
          )}
        </div>
      ) : null}
    </div>
  );
}
