'use client';

import { formatNumber, toNumber } from '@/lib/helpers';
import type { CustomPriceMarket } from '@/types';
import { IconAward, IconTargetArrow } from '@tabler/icons-react';
import React from 'react';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useWriteContract } from 'wagmi';
import { abi } from '@/lib/abis/ZolifyPricePredictions.abi.json';
import { CONTRACT_ADDRESS } from '@/lib/constants';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  const { writeContractAsync, isPending } = useWriteContract();
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

  async function claim() {
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'claim',
        args: [BigInt(market.onchain_id)],
      });

      toast(`Successfully claimed ${formatNumber(claimAmount)} ${market.bettingToken.symbol}}`);
    } catch (e) {
      console.error(e);
      toast('Could not claim rewards');
    }
  }

  const hasClaimed = (market.claims || []).length > 0;

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

      {claimAmount ? (
        <Button
          onClick={claim}
          disabled={hasClaimed || isPending}
          variant="default"
          className="w-full h-10.5 gap-1 bg-violet-500 text-white hover:bg-violet-600 mt-4"
        >
          {isPending ? (
            <Loader2 className="size-3.5 opacity-60 animate-spin" strokeWidth={2.5} />
          ) : null}

          <IconAward className="size-4.5 opacity-100" />
          <span>
            {hasClaimed ? 'Claimed' : 'Claim'}&nbsp;
            <span className="font-medium">
              {formatNumber(claimAmount)} {market.bettingToken.symbol}
            </span>
          </span>
        </Button>
      ) : null}
    </div>
  );
}
