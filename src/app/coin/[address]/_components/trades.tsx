'use client';

import React from 'react';
import { IconAppWindow, IconCircleSquare, IconStar } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Bell, Clock, Copy } from 'lucide-react';
import { copyToClipboard, truncate } from '@/lib/helpers';
import { format } from 'date-fns';
import { Alert } from '@/generated/prisma';
import SwapWidget from './swap-widget';
import type { CustomPriceMarket } from '@/types';
import MarketCard from '@/components/global/MarketCard';

type Props = {
  coin: Coin;
  alerts?: Alert[];
  markets: CustomPriceMarket[];
  inWatchlist?: boolean;
};

export default function CoinTrades({ coin, markets }: Props) {
  const details = [
    {
      icon: Clock,
      title: 'Created',
      value: (
        <p className="text-sm font-medium">{format(coin.created_at, 'MMM dd, yyyy, h:mm a')}</p>
      ),
    },
    {
      icon: IconAppWindow,
      title: 'Contract Address',
      value: (
        <p className="flex items-center gap-1.5">
          <span className="text-sm font-medium">{truncate(coin.address)}</span>
          <button onClick={() => copyToClipboard(coin.address)}>
            <Copy className="size-3.5 opacity-50" />
          </button>
        </p>
      ),
    },
    {
      icon: IconCircleSquare,
      title: 'Pair',
      value: <p className="text-sm font-medium">{coin.poolToken.name}</p>,
    },
  ];

  return (
    <React.Fragment>
      {markets.length > 0 ? (
        <div className="px-3 py-2 w-full max-w-md mx-auto flex flex-col gap-4">
          <h2 className="font-bold text-2xl mt-5 text-center">Price Predictions</h2>
          <div className="w-full flex flex-col gap-3">
            {markets.map((market, idx) => (
              <MarketCard market={market} key={idx} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="max-w-md mx-auto border-b">
        <SwapWidget coin={coin} />
      </div>

      <div className="px-3 py-2 w-full max-w-md mx-auto border-b flex items-center gap-3">
        <Button className="flex-1 h-10.5" size={'lg'} variant={'outline'}>
          <IconStar />
          <span>Watchlist</span>
        </Button>
        <Button className="flex-1 h-10.5" size={'lg'} variant={'outline'}>
          <Bell />
          <span>Alerts</span>
        </Button>
      </div>

      <div className="px-3 py-2 w-full max-w-md mx-auto">
        {details.map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between px-4 py-3 rounded-lg even:bg-secondary"
          >
            <div className="flex items-center gap-2.5">
              <item.icon className="size-4.5 opacity-50" />
              <p className="font-medium text-sm opacity-60">{item.title}</p>
            </div>

            {item.value}
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}
