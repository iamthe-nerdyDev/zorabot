'use client';

import React, { type PropsWithChildren } from 'react';
import { createConfig, EVM, config } from '@lifi/sdk';
import { getWalletClient } from '@wagmi/core';
import { wagmiConfig } from '@/lib/wagmi/config';
import { WagmiProvider } from '@privy-io/wagmi';
import { useApp } from '@/hooks/useApp';

createConfig({
  integrator: 'ZoraCore',
  preloadChains: true,
  providers: [
    EVM({
      getWalletClient: () => getWalletClient(wagmiConfig),
    }),
  ],
});

export default function CustomWagmiProvider({ children }: PropsWithChildren) {
  const app = useApp();

  React.useEffect(() => {
    if (app.user) config.set({ ...config.get(), userId: app.user.id });
  }, [app.user]);

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      {children}
    </WagmiProvider>
  );
}
