'use client';

import useSIWE from '@/hooks/useSIWE';
import React from 'react';
import { Button } from '../ui/button';
import useMain from '@/hooks/useMain';
import { useApp } from '@/hooks/useApp';
import { Loader2 } from 'lucide-react';

export default function ConnectButton() {
  const { signIn, isSigningIn } = useSIWE();
  const { connect, account } = useMain();
  const app = useApp();

  React.useEffect(() => {
    if (isSigningIn) return;
    if (!account.address) return;
    if (app.user) return;
    // --
    signIn();
  }, [account.address, app.user, isSigningIn]);

  return (
    <Button className="rounded-lg" disabled={isSigningIn} onClick={connect}>
      {isSigningIn ? <Loader2 className="size-3.5 opacity-50 animate-spin" /> : null}
      <span>Connect Wallet</span>
    </Button>
  );
}
