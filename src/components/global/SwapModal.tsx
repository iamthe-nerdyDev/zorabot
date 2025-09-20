'use client';

import SwapWidget from '@/app/coin/[address]/_components/swap-widget';
import useModal from '@/hooks/useModal';
import { CircleDollarSign, X } from 'lucide-react';
import React from 'react';

type Props = {
  coin: Coin;
  action?: 'Buy' | 'Sell';
};

export default function SwapModal({ coin, action = 'Buy' }: Props) {
  const { close } = useModal();

  return (
    <div>
      <div className="flex items-center justify-between p-3.5 border-b">
        <div className="flex items-center gap-2">
          <CircleDollarSign className="opacity-60 size-4" strokeWidth={2} />
          <span className="font-medium text-sm text-green-500">
            {action} {coin.name}
          </span>
        </div>

        <button onClick={close}>
          <X className="size-4 opacity-60" />
        </button>
      </div>

      <div className="-mt-1 mb-3">
        <SwapWidget isBuy={action === 'Buy'} coin={coin} bgColor={'#111111'} />
      </div>
    </div>
  );
}
