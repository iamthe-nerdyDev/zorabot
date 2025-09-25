'use client';

import React from 'react';
import { Button } from '../ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { cn } from '@/lib/utils';

export default function ConnectButton({ className }: { className?: string }) {
  const { login, ready } = usePrivy();
  const { isReconnecting, isConnecting } = useAccount();

  // --
  const loading = !ready || isReconnecting || isConnecting;

  return (
    <Button className={cn('rounded-lg', className)} disabled={loading} onClick={login}>
      {loading ? <Loader2 className="size-3.5 opacity-60 animate-spin" strokeWidth={2.5} /> : null}
      <span>Connect Wallet</span>
    </Button>
  );
}
