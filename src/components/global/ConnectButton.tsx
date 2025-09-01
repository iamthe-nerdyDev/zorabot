'use client';

import React from 'react';
import { Button } from '../ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { Loader2 } from 'lucide-react';

export default function ConnectButton() {
  const { login, ready } = usePrivy();

  return (
    <Button className="rounded-lg" disabled={!ready} onClick={login}>
      {!ready ? <Loader2 className="size-3.5 opacity-60 animate-spin" strokeWidth={2.5} /> : null}
      <span>Connect Wallet</span>
    </Button>
  );
}
