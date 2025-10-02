'use client';

import { formatNumber, toNumber } from '@/lib/helpers';
import React from 'react';
import { Button } from '../ui/button';
import { IconAward, IconScale } from '@tabler/icons-react';
import type { CustomPriceMarket } from '@/types';
import { calculatePotentialWin } from './UserMarketHoldings';
import { abi } from '@/lib/abis/ZolifyPricePredictions.abi.json';
import { CONTRACT_ADDRESS } from '@/lib/constants';
import { toast } from 'sonner';
import { useWriteContract } from 'wagmi';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  market: CustomPriceMarket;
  disableClick?: boolean;
}

export function MarketResolved({ market, disableClick = true }: Props) {
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

  return !market.resolved || claimAmount == null || shares.length === 0 ? null : claimAmount === 0 ? (
    <div className="flex items-center gap-1.5">
      <IconScale className="opacity-50" size={17} />
      <div className="text-sm">
        <span className="opacity-50">Market resolved as</span>&nbsp;
        <span
          className={cn(
            'font-semibold',
            market.outcome === 'YES' ? 'text-green-500' : 'text-red-500'
          )}
        >
          {market.outcome}
        </span>
      </div>
    </div>
  ) : (
    <Button
      onClick={() => {
        if (disableClick) return;
        claim();
      }}
      disabled={hasClaimed || isPending}
      variant="default"
      className="w-full h-10.5 gap-1 bg-violet-500 text-white hover:bg-violet-600 mt-2"
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
  );
}
