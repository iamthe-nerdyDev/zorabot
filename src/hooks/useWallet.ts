'use client';

import { type ConnectedWallet, useWallets } from '@privy-io/react-auth';

export default function () {
  const { wallets, ready } = useWallets();
  // --
  return {
    ready,
    wallet: wallets[0] as ConnectedWallet | undefined,
  };
}
