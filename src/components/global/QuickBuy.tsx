'use client';

import useModal from '@/hooks/useModal';
import { Button } from '../ui/button';
import SwapModal from './SwapModal';
import { Coins } from 'lucide-react';
import React from 'react';

type Props = {
  coin: Coin;
  action?: 'Buy' | 'Sell';
};

export default function QuickBuy({ coin, action = 'Buy' }: Props) {
  const { open } = useModal();

  return (
    <Button
      variant={'outline'}
      className="w-full h-9.5 border-violet-300 text-violet-300"
      onClick={() => open({ content: <SwapModal action={action} coin={coin} /> })}
    >
      <span className="-ml-0.5 font-semibold font-mono text-xs">{action}</span>
      <Coins strokeWidth={2} className="size-3.5" />
    </Button>
  );
}
