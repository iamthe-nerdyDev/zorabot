'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { IconFall, IconGasStation } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import Ethereum from '@/components/icons/Ethereum';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Wallet2 } from 'lucide-react';
import SmartImage from '@/components/global/SmartImage';

const PRESET_BUYS = [0.01, 0.02, 0.5, 1];
const PRESET_SELLS = [25, 50, 75, 100];

export default function CoinTrades({ coin }: { coin: Coin }) {
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
                    <Input className="w-full h-8.5" style={{ fontSize: '13px' }} />
                    <Ethereum
                      fill="#aaa"
                      className="size-3.5 absolute right-4 opacity-70 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {PRESET_BUYS.map((value) => (
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
                  <div className="flex items-center justify-between">
                    <p className="text-xs opacity-60 font-medium">Gas & Slippage</p>
                    <div className="flex items-center gap-3">
                      <p className="flex items-center gap-1">
                        <IconGasStation className="size-4 opacity-60" strokeWidth={1.5} />
                        <span className="text-xs font-medium">0.01</span>
                      </p>

                      <p className="flex items-center gap-1">
                        <IconFall className="size-4 opacity-60" strokeWidth={1.5} />
                        <span className="text-xs font-medium">10%</span>
                      </p>

                      <div className="h-4">
                        <Separator orientation="vertical" />
                      </div>
                      <ChevronRight className="size-4 opacity-60" />
                    </div>
                  </div>

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
                  <span className="font-semibold text-xs text-red-500">0 {coin.symbol}</span>
                </p>

                <div className="bg-secondary/40 p-1.5 border rounded-lg flex items-center gap-1 relative mb-2.5">
                  <span className="text-xs uppercase font-medium w-17 text-center shrink-0">
                    Amount
                  </span>
                  <div className="bg-background rounded-lg w-full">
                    <Input className="w-full h-8.5" style={{ fontSize: '13px' }} />
                    <SmartImage
                      src={coin.mediaContent.previewImage.medium}
                      alt={coin.symbol}
                      className="size-4.5 rounded-full"
                      loaderClassName="size-4.5 rounded-full bg-secondary absolute right-4 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {PRESET_SELLS.map((value) => (
                    <Button key={value} className="flex-1 h-10" variant={'outline'}>
                      <span className="text-[13px]">{value}%</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <Separator />
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs opacity-60 font-medium">Gas & Slippage</p>
                    <div className="flex items-center gap-3">
                      <p className="flex items-center gap-1">
                        <IconGasStation className="size-4 opacity-60" strokeWidth={1.5} />
                        <span className="text-xs font-medium">0.01</span>
                      </p>

                      <p className="flex items-center gap-1">
                        <IconFall className="size-4 opacity-60" strokeWidth={1.5} />
                        <span className="text-xs font-medium">10%</span>
                      </p>

                      <div className="h-4">
                        <Separator orientation="vertical" />
                      </div>
                      <ChevronRight className="size-4 opacity-60" />
                    </div>
                  </div>

                  <Button size={'lg'} className="w-full h-11">
                    Insufficient Funds
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div></div>
    </React.Fragment>
  );
}
