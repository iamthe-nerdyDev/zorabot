'use client';

import { useWallets } from '@privy-io/react-auth';
import React from 'react';

export default function WatchlistComponent() {
  const { wallets, ready: walletsReady } = useWallets();

  return (
    <div>
      {String(walletsReady)}
      {JSON.stringify(wallets)}
    </div>
  );
}
