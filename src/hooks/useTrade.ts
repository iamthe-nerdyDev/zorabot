'use client';

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
import useWallet from './useWallet';

export default function () {
  const storage = useStorage();
  const { wallet } = useWallet();

  const quote = React.useCallback(
    async (action: 'buy' | 'sell', from: string, to: string, amount: string) => {
      if (!wallet) return;
      // --
      return await getQuote({
        fromAddress: wallet.address,
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
    [wallet]
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
