'use client';

import React from 'react';
import { Button } from '../ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';

export default function ConnectButton() {
  const { login, ready } = usePrivy();
  const { isReconnecting, isConnecting } = useAccount();

  // --
  const loading = !ready || isReconnecting || isConnecting;

  return (
    <Button className="rounded-lg" disabled={loading} onClick={login}>
      {loading ? <Loader2 className="size-3.5 opacity-60 animate-spin" strokeWidth={2.5} /> : null}
      <span>Connect Wallet</span>
    </Button>
  );
}
