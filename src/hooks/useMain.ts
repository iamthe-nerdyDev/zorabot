'use client';

import { useConnectWallet } from '@privy-io/react-auth';
import { useAccount, useConnect, useReconnect } from 'wagmi';
import {
  ChainId,
  convertQuoteToRoute,
  executeRoute,
  getQuote,
  type RouteExtended,
  type LiFiStep,
} from '@lifi/sdk';
import { useApp } from './useApp';
import React from 'react';
import { useStorage } from './useStorage';
import { BUY_PERCENTAGE, SELL_PERCENTAGE } from '@/lib/constants';

export default function () {
  const { connectWallet } = useConnectWallet();
  const { connect: c, connectors } = useConnect();
  const { reconnect } = useReconnect();
  const account = useAccount();
  const app = useApp();
  const storage = useStorage();

  React.useEffect(() => {
    reconnect();
  }, []);

  const connect = React.useCallback(() => {
    if (!app.isReady) return;
    if (!app.isInMiniApp) return connectWallet();
    // --
    const farcasterConnector = connectors.find((c) => c.id === 'farcaster');
    if (farcasterConnector) c({ connector: farcasterConnector });
    else alert('Could not connect wallet');
  }, [app.isReady, app.isInMiniApp, connectors]);

  const quote = React.useCallback(
    async (action: 'buy' | 'sell', from: string, to: string, amount: string) => {
      if (!account.address) return;
      // --
      return await getQuote({
        fromAddress: account.address,
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
    [app.isReady, app.isInMiniApp, account.address]
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
    [app.isReady, app.isInMiniApp]
  );

  return { account, connect, quote, swap };
}
