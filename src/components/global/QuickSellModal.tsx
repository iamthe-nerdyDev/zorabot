'use client';

import useModal from '@/hooks/useModal';
import { useStorage } from '@/hooks/useStorage';
import { ArrowRight, Percent, X } from 'lucide-react';
import React from 'react';
import { Input } from '../ui/input';
import SmartImage from './SmartImage';
import { Button } from '../ui/button';

type Props = {
  balance: string;
  coin: Coin;
};

const toBalance = (balance: string) => {
  return (BigInt(balance) / BigInt(10 ** 18)).toString();
};

export default function QuickSellModal({ balance, coin }: Props) {
  const { close } = useModal();
  const storage = useStorage();

  return (
    <div className="pb-5">
      <div className="flex items-center justify-between p-3.5 border-b">
        <div className="flex items-center gap-2">
          <Percent className="opacity-60 size-4" strokeWidth={2} />
          <span className="font-medium text-sm text-red-500">Sell {coin.symbol}</span>
        </div>

        <button onClick={close}>
          <X className="size-4 opacity-60" />
        </button>
      </div>

      <div className="space-y-4">
        <p className="py-4 px-3.5 -mb-3 font-medium text-[15px] flex items-center gap-2">
          <span>Total Holding:</span>
          <ArrowRight className="size-3 opacity-50" />
          <span className="border-b-[1.5px] border-dotted border-gray-400">
            {Number(toBalance(balance)).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </span>
        </p>

        <div className="p-3.5 pb-0">
          <div className="bg-secondary/40 p-1.5 border rounded-lg flex items-center gap-1 relative mb-2.5">
            <span className="text-xs uppercase font-semibold w-17 text-center shrink-0">
              Amount
            </span>
            <div className="bg-background rounded-lg w-full">
              <Input
                className="w-full h-9 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
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
                <span className="text-[13px] font-medium">{value}%</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="px-3.5">
          <Button size={'lg'} className="w-full h-11">
            Insufficient Funds
          </Button>
        </div>
      </div>
    </div>
  );
}
