'use modal';

import React from 'react';
import type { CustomPriceMarket } from '@/types';
import { MarketTime } from './MarketTime';
import { Button } from '../ui/button';
import {
  IconActivity,
  IconChartBar,
  IconCoins,
  IconScale,
  IconShare3,
  IconTrendingUp,
  IconX,
} from '@tabler/icons-react';
import useModal from '@/hooks/useModal';
import Link from 'next/link';
import { buildQuestion, toNumber, utcString } from '@/lib/helpers';
import { MarketProgress } from './MarketProgress';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useQuery } from '@tanstack/react-query';
import CoinChart from '@/app/coin/[address]/_components/chart';
import { Loader } from './Loader';
import { BASE_URL } from '@/lib/constants';
import MarketActivity from './MarketActivity';
import MarketSharesBuy from './MarketSharesBuy';
import UserMarketHoldings from './UserMarketHoldings';
import { toast } from 'sonner';

type Props = {
  market: CustomPriceMarket;
  isTrending?: boolean;
};

type ChartResponse = {
  data: {
    chart: ZoraChart | null;
    price: string;
  };
};

export default function MarketModal({ market, isTrending = false }: Props) {
  const { close } = useModal();
  const total = React.useMemo(() => {
    return (
      toNumber(market.totalNoShares, market.bettingToken.decimals) +
      toNumber(market.totalYesShares, market.bettingToken.decimals)
    );
  }, [market]);

  const buttons = [
    {
      title: 'Close',
      icon: IconX,
      onclick: close,
    },
    {
      title: 'Share',
      icon: IconShare3,
      onclick: async () => {
        if (!navigator.share) {
          toast('Sharing not supported on this browser.');
          return;
        }

        const url = `${BASE_URL}/coin/${market.token.address}`;
        try {
          await navigator.share({
            title: 'I just found a gem 💎!',
            text: `Check it out here: ${url}`,
            url,
          });
        } catch (e) {
          console.error('Error sharing:', e);
        }
      },
    },
  ];

  const { data, isLoading } = useQuery<ChartResponse>({
    queryKey: ['chart', market.token.address],
    queryFn: async () => {
      const res = await fetch(`/api/coin/${market.token.address}/chart`);
      // --
      if (!res.ok) return null;
      return res.json();
    },
  });

  const sourceOfTruth = `${BASE_URL}/coin/${market.token.address}`;

  return (
    <div className="p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <p>Created by</p>
          <div className="flex items-center gap-2">
            <img className="size-6 rounded-full" src={'/logo.png'} />
            <Link
              href={'#'}
              target="_blank"
              className="border-dotted border-b border-gray-200 opacity-70 hover:opacity-100"
            >
              Zolify
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {buttons.map((b) => (
            <Tooltip key={b.title}>
              <TooltipTrigger>
                <Button
                  className="rounded-full p-2"
                  variant={'outline'}
                  size={'icon'}
                  onClick={b.onclick}
                  asChild
                >
                  <b.icon strokeWidth={1.8} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{b.title}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      <MarketTime className="mb-0" prefix="Ends in" endTime={new Date(market.endTs)} />

      <h3 className="leading-7 mb-1 text-lg font-medium">💎 {buildQuestion(market)}</h3>

      <MarketProgress
        className="mb-2"
        totalNoShares={market.totalNoShares}
        totalYesShares={market.totalYesShares}
      />

      <div className="flex items-center gap-1.5 justify-end mb-3.5">
        {isTrending && <IconTrendingUp className="size-5 opacity-60" strokeWidth={1.6} />}
        <IconCoins className="size-5 opacity-60" strokeWidth={1.6} />
        <p className="opacity-80 font-medium text-sm">
          {total.toLocaleString()} {market.bettingToken.symbol}
        </p>
      </div>

      {market.shares && market.shares.length > 0 ? (
        <div className="border rounded-lg mb-3">
          <UserMarketHoldings market={market} />
        </div>
      ) : null}

      <div className="border rounded-lg mb-3">
        <MarketSharesBuy market={market} />
      </div>

      <Tabs defaultValue="resolution" className="w-full">
        <TabsList className="w-full h-10">
          <TabsTrigger value="resolution">
            <IconScale strokeWidth={1.5} />
            <span className="text-[13px]">Resolution</span>
          </TabsTrigger>
          <TabsTrigger value="asset">
            <IconChartBar strokeWidth={1.5} />
            <span className="text-[13px]">Asset Price</span>
          </TabsTrigger>
          <TabsTrigger value="activity">
            <IconActivity strokeWidth={1.5} />
            <span className="text-[13px]">Activity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resolution">
          <div className="flex flex-col gap-3 py-2">
            <Link href={`#`} target="_blank" className="w-fit text-gray-400">
              Resolution is decentralized
            </Link>

            <p className="break-words leading-7">
              This market will resolve to "YES" if the price of&nbsp;
              <Link
                target="_blank"
                className="border-b border-gray-400"
                href={`/coin/${market.token.address}`}
              >
                {market.token.name}
              </Link>
              &nbsp;is&nbsp;
              {market.targetIsAboveTargetPrice ? 'above' : 'below'} $
              {toNumber(market.targetPrice, 6)} on {utcString(new Date(market.endTs))} UTC, based on
              the data provided by&nbsp;
              <Link target="_blank" className="border-b border-gray-400" href={sourceOfTruth}>
                {sourceOfTruth}
              </Link>
              . Otherwise, the market will resolve to "NO".
            </p>
          </div>
        </TabsContent>

        <TabsContent value="asset">
          <div className="border rounded-xl">
            {isLoading || !data ? (
              <div className="flex items-center justify-center h-80">
                <Loader />
              </div>
            ) : (
              <CoinChart
                data={data?.data.chart}
                price={Number(data.data.price || '0')}
                height={200}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <MarketActivity id={market.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
