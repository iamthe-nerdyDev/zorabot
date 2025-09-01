'use client';

import useWallet from '@/hooks/useWallet';
import { usePrivy } from '@privy-io/react-auth';
import React from 'react';
import { useAccount } from 'wagmi';

export default function WatchlistComponent() {
  const { wallet } = useWallet();
  const { user } = usePrivy();
  const account = useAccount();

  return (
    <div>
      {JSON.stringify(account)}
      {JSON.stringify(user)}
      {JSON.stringify(wallet)}
    </div>
  );
}
