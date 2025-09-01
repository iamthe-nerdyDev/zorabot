'use client';

import { useAccount } from 'wagmi';
import {
  ChainId,
  convertQuoteToRoute,
  executeRoute,
  getQuote,
  type RouteExtended,
  type LiFiStep,
} from '@lifi/sdk';
import React from 'react';
import { useStorage } from './useStorage';
import { BUY_PERCENTAGE, SELL_PERCENTAGE } from '@/lib/constants';

export default function () {
  const storage = useStorage();
  const { address } = useAccount();

  const quote = React.useCallback(
    async (action: 'buy' | 'sell', from: string, to: string, amount: string) => {
      if (!address) return;
      // --
      return await getQuote({
        fromAddress: address,
        fromChain: ChainId.BAS,
        toChain: ChainId.BAS,
        fromToken: from,
        toToken: to,
        fromAmount: amount,
        slippage: (action === 'buy' ? storage.buySlippage : storage.sellSlippage) / 100,
        order: storage.quoteOrder,
        fee: (action === 'buy' ? BUY_PERCENTAGE : SELL_PERCENTAGE) / 100,
      });
    },
    [address]
  );

  const swap = React.useCallback(
    async (quote: LiFiStep, updateRouteHook?: (route: RouteExtended) => void) => {
      const route = convertQuoteToRoute(quote);
      return await executeRoute(route, {
        updateRouteHook(route) {
          updateRouteHook?.(route);
        },
      });
    },
    []
  );

  return { quote, swap };
}
