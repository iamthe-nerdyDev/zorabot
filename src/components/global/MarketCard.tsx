'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { buildQuestion, toNumber } from '@/lib/helpers';
import type { CustomPriceMarket } from '@/types';
import { MarketTime } from './MarketTime';
import { MarketProgress } from './MarketProgress';
import { MarketResolved } from './MarketResolved';
import { MarketPending } from './MarketPending';
import { IconCoins, IconTrendingUp } from '@tabler/icons-react';
import { Separator } from '../ui/separator';
import useModal from '@/hooks/useModal';
import MarketModal from './MarketModal';

type Props = {
  market: CustomPriceMarket;
  isTrending?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

export default function MarketCard({ ref, market, isTrending = false }: Props) {
  const { open } = useModal();
  const total = React.useMemo(() => {
    return (
      toNumber(market.totalNoShares, market.bettingToken.decimals) +
      toNumber(market.totalYesShares, market.bettingToken.decimals)
    );
  }, [market]);

  return (
    <Card
      className="flex flex-col py-5 hover:border-white cursor-pointer"
      ref={ref}
      role="button"
      onClick={() => open({ content: <MarketModal market={market} isTrending={isTrending} /> })}
    >
      <CardHeader className="px-5">
        <CardTitle className="leading-6">💎 {buildQuestion(market)}</CardTitle>
        <MarketTime endTime={new Date(market.endTs)} />
      </CardHeader>
      <CardContent className="px-5">
        <div className="mb-5">
          <MarketProgress
            totalNoShares={market.totalNoShares}
            totalYesShares={market.totalYesShares}
          />

          {new Date(market.endTs) < new Date() ? (
            market.resolved ? (
              <MarketResolved market={market} />
            ) : (
              <MarketPending />
            )
          ) : null}
        </div>

        <Separator className="my-3" />

        <div className="flex items-center gap-1.5 -mb-1">
          {isTrending && <IconTrendingUp className="size-5 opacity-60" strokeWidth={1.6} />}
          <IconCoins className="size-5 opacity-60" strokeWidth={1.6} />
          <p className="opacity-80 font-medium text-sm">
            {total.toLocaleString()} {market.bettingToken.symbol}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
