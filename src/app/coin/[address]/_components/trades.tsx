'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  IconAppWindow,
  IconCircleSquare,
  IconFall,
  IconGasStation,
  IconStar,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import Ethereum from '@/components/icons/Ethereum';
import { Separator } from '@/components/ui/separator';
import { Bell, Bolt, ChevronRight, Clock, Copy, Wallet2, X } from 'lucide-react';
import SmartImage from '@/components/global/SmartImage';
import { copyToClipboard, truncate } from '@/lib/helpers';
import { format } from 'date-fns';
import { useCustomSidebar } from '@/hooks/useCustomSidebar';
import { useStorage } from '@/hooks/useStorage';

const SettingsSidebar = (props: { action: 'buy' | 'sell' }) => {
  const storage = useStorage();
  const { close } = useCustomSidebar();

  return (
    <div>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bolt className="opacity-60 size-3.5" strokeWidth={2} />
          <span className="font-medium text-sm">Order Settings</span>
        </div>

        <button onClick={close}>
          <X className="size-4 opacity-60" />
        </button>
      </div>

      <div className="p-4">
        <Tabs defaultValue={`${props.action}-settings`} className="w-full max-w-md mx-auto">
          <TabsList className="w-full h-10">
            <TabsTrigger value="buy-settings">
              <span className="text-[13px]">Buy Settings</span>
            </TabsTrigger>
            <TabsTrigger value="sell-settings">
              <span className="text-[13px]">Sell Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy-settings">
            <div className="py-3 space-y-6.5">
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <IconGasStation className="text-green-400 size-4.5" />
                  <p className="uppercase text-[13px] font-medium border-b-2 border-dotted border-gray-500">
                    Buy Priority Fee
                  </p>
                </div>

                <div className="bg-secondary/40 p-1.5 border rounded-lg flex items-center gap-1 relative mb-2.5">
                  <span className="text-xs uppercase font-medium w-13 text-center shrink-0">
                    PRIO
                  </span>
                  <div className="bg-background rounded-lg w-full">
                    <Input
                      className="w-full h-8.5 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      type="number"
                      style={{ fontSize: '13px' }}
                      value={String(storage.buyPriorityFee)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!isNaN(Number(value))) storage.setBuyPriorityFee(Number(value));
                      }}
                    />
                    <span className="absolute right-5.5 opacity-70 text-xs font-medium top-1/2 -translate-y-1/2">
                      GWEI
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <IconFall className="text-green-400 size-4.5" />
                  <p className="uppercase text-[13px] font-medium border-b-2 border-dotted border-gray-500">
                    Buy Slippage Limit
                  </p>
                </div>

                <div className="bg-secondary/40 p-1.5 border rounded-lg flex items-center gap-1 relative mb-2.5">
                  <span className="text-xs uppercase font-medium w-15 text-center shrink-0">
                    Max %
                  </span>
                  <div className="bg-background rounded-lg w-full">
                    <Input
                      className="w-full h-8.5 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      style={{ fontSize: '13px' }}
                      max={100}
                      min={0}
                      value={String(storage.buySlippage)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!isNaN(Number(value))) {
                          if (Number(value) < 0) storage.setBuySlippage(0);
                          else if (Number(value) > 100) storage.setBuySlippage(100);
                          else storage.setBuySlippage(Number(value));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="sell-settings">
            <div className="py-3 space-y-6.5">
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <IconGasStation className="text-red-400 size-4.5" />
                  <p className="uppercase text-[13px] font-medium border-b-2 border-dotted border-gray-500">
                    Sell Priority Fee
                  </p>
                </div>

                <div className="bg-secondary/40 p-1.5 border rounded-lg flex items-center gap-1 relative mb-2.5">
                  <span className="text-xs uppercase font-medium w-13 text-center shrink-0">
                    PRIO
                  </span>
                  <div className="bg-background rounded-lg w-full">
                    <Input
                      className="w-full h-8.5 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      type="number"
                      style={{ fontSize: '13px' }}
                      value={String(storage.sellPriorityFee)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!isNaN(Number(value))) storage.setSellPriorityFee(Number(value));
                      }}
                    />
                    <span className="absolute right-5.5 opacity-70 text-xs font-medium top-1/2 -translate-y-1/2">
                      GWEI
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <IconFall className="text-red-400 size-4.5" />
                  <p className="uppercase text-[13px] font-medium border-b-2 border-dotted border-gray-500">
                    Sell Slippage Limit
                  </p>
                </div>

                <div className="bg-secondary/40 p-1.5 border rounded-lg flex items-center gap-1 relative mb-2.5">
                  <span className="text-xs uppercase font-medium w-15 text-center shrink-0">
                    Max %
                  </span>
                  <div className="bg-background rounded-lg w-full">
                    <Input
                      className="w-full h-8.5 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      style={{ fontSize: '13px' }}
                      max={100}
                      min={0}
                      value={String(storage.sellSlippage)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!isNaN(Number(value))) {
                          if (Number(value) < 0) storage.setSellSlippage(0);
                          else if (Number(value) > 100) storage.setSellSlippage(100);
                          else storage.setSellSlippage(Number(value));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default function CoinTrades({ coin }: { coin: Coin }) {
  const { open } = useCustomSidebar();
  const storage = useStorage();
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
            <div className="space-y-5">
              <div>
                <p className="flex items-center gap-1.5 mt-1 mb-3 justify-end">
                  <Wallet2 className="size-3.5 opacity-50" />
                  <span className="font-semibold text-xs text-green-500">0 ETH</span>
                </p>

                <div className="bg-secondary/40 p-1.5 border rounded-lg flex items-center gap-1 relative mb-2.5">
                  <span className="text-xs uppercase font-medium w-17 text-center shrink-0">
                    Amount
                  </span>
                  <div className="bg-background rounded-lg w-full">
                    <Input
                      className="w-full h-8.5 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      style={{ fontSize: '13px' }}
                      type="number"
                    />
                    <Ethereum
                      fill="#aaa"
                      className="size-3.5 absolute right-4 opacity-70 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {storage.buyPresets.map((value) => (
                    <Button key={value} className="flex-1 h-10" variant={'outline'}>
                      <span className="text-[13px]">{value}</span>
                      <Ethereum fill="#aaa" className="size-3.5" />
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <Separator />
                <div className="space-y-3.5">
                  <button
                    className="flex items-center justify-between w-full"
                    onClick={() => open({ content: <SettingsSidebar action="buy" /> })}
                  >
                    <p className="text-xs opacity-60 font-medium">Gas & Slippage</p>
                    <div className="flex items-center gap-3">
                      <p className="flex items-center gap-1">
                        <IconGasStation className="size-4 opacity-60" strokeWidth={1.5} />
                        <span className="text-xs font-medium">{storage.buyPriorityFee}</span>
                      </p>

                      <p className="flex items-center gap-1">
                        <IconFall className="size-4 opacity-60" strokeWidth={1.5} />
                        <span className="text-xs font-medium">{storage.buySlippage}%</span>
                      </p>

                      <div className="h-4">
                        <Separator orientation="vertical" />
                      </div>
                      <ChevronRight className="size-4 opacity-60" />
                    </div>
                  </button>

                  <Button size={'lg'} className="w-full h-11">
                    Insufficient Funds
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sell">
            <div className="space-y-5">
              <div>
                <p className="flex items-center gap-1.5 mt-1 mb-3 justify-end">
                  <Wallet2 className="size-3.5 opacity-50" />
                  <span className="font-semibold text-xs text-red-500 truncate max-w-50">
                    0 {coin.symbol}
                  </span>
                </p>

                <div className="bg-secondary/40 p-1.5 border rounded-lg flex items-center gap-1 relative mb-2.5">
                  <span className="text-xs uppercase font-medium w-17 text-center shrink-0">
                    Amount
                  </span>
                  <div className="bg-background rounded-lg w-full">
                    <Input
                      className="w-full h-8.5 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      style={{ fontSize: '13px' }}
                      type="number"
                    />
                    <SmartImage
                      src={coin.mediaContent.previewImage.medium}
                      alt={coin.symbol}
                      className="size-4.5 rounded-full"
                      loaderClassName="size-4.5 rounded-full bg-secondary absolute right-4 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {storage.sellPresets.map((value) => (
                    <Button key={value} className="flex-1 h-10" variant={'outline'}>
                      <span className="text-[13px]">{value}%</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <Separator />
                <div className="space-y-3.5">
                  <button
                    className="flex items-center justify-between w-full"
                    onClick={() => open({ content: <SettingsSidebar action="sell" /> })}
                  >
                    <p className="text-xs opacity-60 font-medium">Gas & Slippage</p>
                    <div className="flex items-center gap-3">
                      <p className="flex items-center gap-1">
                        <IconGasStation className="size-4 opacity-60" strokeWidth={1.5} />
                        <span className="text-xs font-medium">{storage.sellPriorityFee}</span>
                      </p>

                      <p className="flex items-center gap-1">
                        <IconFall className="size-4 opacity-60" strokeWidth={1.5} />
                        <span className="text-xs font-medium">{storage.sellSlippage}%</span>
                      </p>

                      <div className="h-4">
                        <Separator orientation="vertical" />
                      </div>
                      <ChevronRight className="size-4 opacity-60" />
                    </div>
                  </button>

                  <Button size={'lg'} className="w-full h-11">
                    Insufficient Funds
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="lg:px-3 py-2 w-full max-w-md mx-auto border-b flex items-center gap-3">
        <Button className="flex-1 h-10.5" size={'lg'} variant={'outline'}>
          <IconStar />
          <span>Watchlist</span>
        </Button>
        <Button className="flex-1 h-10.5" size={'lg'} variant={'outline'}>
          <Bell />
          <span>Alerts</span>
        </Button>
      </div>

      <div className="lg:px-3 py-2 w-full max-w-md mx-auto">
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
