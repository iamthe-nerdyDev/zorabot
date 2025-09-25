'use client';

import { cn } from '@/lib/utils';
import { ArrowRightLeft, Copy, History, User2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import CoinChart from './chart';
import SmartImage from '@/components/global/SmartImage';
import { copyToClipboard, formatNumber } from '@/lib/helpers';
import TimeAgo from '@/components/global/TimeAgo';
import Basescan from '@/components/icons/Basescan';
import { Separator } from '@/components/ui/separator';
import CoinSwaps from './swaps';
import CoinTrades from './trades';
import CoinHolders from './holders';
import { Alert } from '@/generated/prisma';
import type { CustomPriceMarket } from '@/types';

type Props = {
  data: {
    markets: CustomPriceMarket[];
    coin: Coin;
    chart: ZoraChart;
    alerts?: Alert[];
    inWatchlist?: boolean;
  };
};

export default function RenderCoin({ data }: Props) {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  const showFallback = (tab: string | null) => {
    if (!tab) return true;
    if (!['trade', 'holders', 'swaps'].includes(tab)) return true;
    return false;
  };

  const tabs = React.useMemo(() => {
    return [
      {
        icon: ArrowRightLeft,
        title: 'Trade',
        isActive: !tab || tab === 'trade',
        href: '?tab=trade',
      },
      {
        icon: User2,
        title: 'Holders',
        isActive: tab === 'holders',
        href: '?tab=holders',
      },
      {
        icon: History,
        title: 'Swaps',
        isActive: tab === 'swaps',
        href: '?tab=swaps',
      },
    ];
  }, [tab]);

  const Tab = React.useMemo(() => {
    if (tab === 'trade') return CoinTrades;
    if (tab === 'holders') return CoinHolders;
    if (tab === 'swaps') return CoinSwaps;
    return CoinTrades;
  }, [tab]);

  return (
    <div className="overflow-x-hidden lg:flex lg:overflow-y-hidden lg:h-[91dvh]">
      <section className="w-full lg:w-[calc(100vw-520px)]">
        <div className="p-4 border-b flex flex-col gap-4 md:flex-row md:items-center md:gap-8 lg:flex-col lg:items-start lg:gap-4 xl:flex-row xl:items-center xl:gap-8">
          <div className="flex items-center gap-2.5 pr-">
            <SmartImage
              src={data.coin.mediaContent.previewImage.medium}
              alt={data.coin.symbol}
              className="size-9 rounded-full"
              loaderClassName="size-9 rounded-full bg-secondary"
            />
            <div className="space-y-[1px]">
              <h4 className="flex items-center gap-1">
                <span className="font-medium text-[13px] w-max md:max-w-[180px] lg:max-w-[350px] md:truncate xl:max-w-75 xl:truncate">
                  {data.coin.symbol}
                </span>
                <button
                  className="opacity-60 shrink-0"
                  onClick={() => copyToClipboard(data.coin.address)}
                >
                  <Copy className="size-3" strokeWidth={3} />
                </button>
              </h4>
              <div className="flex items-center gap-1.5">
                <TimeAgo
                  className="text-green-600 font-semibold text-xs opacity-100"
                  date={data.coin.created_at}
                />
                <a href={`https://basescan.org/address/${data.coin.address}`} target="_blank">
                  <Basescan className="size-[13px] dark:text-[#555] #eee" />
                </a>
              </div>
            </div>
          </div>

          <div className="h-8 hidden md:block lg:hidden xl:block">
            <Separator orientation="vertical" />
          </div>

          <div className="flex items-center gap-10">
            <div>
              <p className="text-xs opacity-60 font-medium">Price</p>
              <p className="text-sm font-medium">
                ${formatNumber(Number(data.coin.price.priceInUsdc), false)}
              </p>
            </div>

            <div>
              <p className="text-xs opacity-60 font-medium">Mkt Price</p>
              <p className="text-sm font-medium">${formatNumber(Number(data.coin.marketCap))}</p>
            </div>

            <div>
              <p className="text-xs opacity-60 font-medium">Total Volume</p>
              <p className="text-sm font-medium">${formatNumber(Number(data.coin.totalVolume))}</p>
            </div>

            <div>
              <p className="text-xs opacity-60 font-medium">Volume (24h)</p>
              <p className="text-sm font-medium">${formatNumber(Number(data.coin.volume24h))}</p>
            </div>
          </div>
        </div>

        <div>
          <div className={cn('hidden lg:block', (showFallback(tab) || tab === 'trade') && 'block')}>
            <CoinChart data={data.chart} price={Number(data.coin.price.priceInUsdc)} />
          </div>
          <div className="block lg:hidden mb-20">
            <Tab
              coin={data.coin}
              alerts={data.alerts}
              inWatchlist={data.inWatchlist}
              markets={data.markets}
            />
          </div>
        </div>
      </section>

      <aside className="hidden lg:block w-130 border-l h-full overflow-y-auto">
        <nav className="w-full flex items-center border-b sticky top-0 bg-background z-20">
          {tabs.map((item, idx) => (
            <Link
              className={cn(
                'w-1/3 text-center text-[13px] p-3 font-medium opacity-60 flex items-center gap-[5px] justify-center',
                idx !== tabs.length - 1 && 'border-r',
                item.isActive && 'text-green-400 opacity-100'
              )}
              href={item.href}
              key={item.title}
            >
              <item.icon className="size-[13px]" />
              <p>{item.title}</p>
            </Link>
          ))}
        </nav>

        <Tab
          coin={data.coin}
          alerts={data.alerts}
          inWatchlist={data.inWatchlist}
          markets={data.markets}
        />
      </aside>

      <nav className="flex gap-5 py-3 px-5.5 lg:hidden bg-background fixed bottom-0 border z-20 rounded-full left-1/2 -translate-1/2">
        {tabs.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              'flex items-center justify-center gap-[5px] opacity-60',
              item.isActive && 'text-green-400 opacity-100'
            )}
          >
            <item.icon className="size-[13px]" />
            <p className="text-[13px] font-medium">{item.title}</p>
          </Link>
        ))}
      </nav>
    </div>
  );
}
