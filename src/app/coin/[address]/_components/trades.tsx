'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconAppWindow, IconCircleSquare, IconStar } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Bell, Clock, Copy } from 'lucide-react';
import { copyToClipboard, truncate } from '@/lib/helpers';
import { format } from 'date-fns';
import { Alert } from '@/generated/prisma';
import Buy from './trades/_components/buy';
import Sell from './trades/_components/sell';

type Props = {
  coin: Coin;
  alerts?: Alert[];
  inWatchlist?: boolean;
};

export default function CoinTrades({ coin }: Props) {
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
      <div className="border-t border-b lg:border-t-0 p-3 w-full pb-5">
        <Tabs defaultValue="buy" className="w-full max-w-md mx-auto">
          <TabsList className="w-full h-10">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>

          <TabsContent value="buy">
            <Buy coin={coin} balance={0} />
          </TabsContent>

          <TabsContent value="sell">
            <Sell coin={coin} balance={0} />
          </TabsContent>
        </Tabs>
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
