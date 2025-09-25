'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import React from 'react';

export default function () {
  const { address } = useAccount();
  const { user } = usePrivy();
  // --
  return React.useMemo(
    () => (address || user?.wallet?.address)?.toLowerCase(),
    [address, user?.wallet]
  );
}
