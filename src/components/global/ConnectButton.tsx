'use client';

import React from 'react';
import { Button } from '../ui/button';
import { usePrivy } from '@privy-io/react-auth';

export default function ConnectButton() {
  const { login } = usePrivy();

  return (
    <Button className="rounded-lg" onClick={login}>
      <span>Connect Wallet</span>
    </Button>
  );
}
