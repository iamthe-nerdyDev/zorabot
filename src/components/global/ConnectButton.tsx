'use client';

import React from 'react';
import { Button } from '../ui/button';
import { usePrivy } from '@privy-io/react-auth';
import useWallet from '@/hooks/useWallet';
import { Loader2 } from 'lucide-react';

export default function ConnectButton() {
  const { login } = usePrivy();
  const { ready } = useWallet();

  return (
    <Button className="rounded-lg" disabled={!ready} onClick={login}>
      {!ready ? <Loader2 className="size-3.5 opacity-60" strokeWidth={2.5} /> : null}
      <span>Connect Wallet</span>
    </Button>
  );
}
