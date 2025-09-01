'use client';

import React, { type PropsWithChildren } from 'react';
import { createConfig, EVM, config } from '@lifi/sdk';
import { getWalletClient } from '@wagmi/core';
import { wagmiConfig } from '@/lib/wagmi/config';
import { WagmiProvider } from '@privy-io/wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { Loader } from '../global/Loader';
import miniappSdk from '@farcaster/miniapp-sdk';
import { useLoginToMiniApp } from '@privy-io/react-auth/farcaster';

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
  const { ready, authenticated, user } = usePrivy();
  const { initLoginToMiniApp, loginToMiniApp } = useLoginToMiniApp();
  const [isSDKLoaded, setIsSDKLoaded] = React.useState(false);
  const [isInMiniApp, setIsInMiniApp] = React.useState(false);

  React.useEffect(() => {
    async function init() {
      if (!miniappSdk || isSDKLoaded) return;
      // --
      const response = await miniappSdk.isInMiniApp();
      setIsInMiniApp(response);
      if (response) {
        miniappSdk.back.enableWebNavigation();
        miniappSdk.actions.ready();
      }

      setIsSDKLoaded(true);
    }

    init();
  }, [isSDKLoaded]);

  React.useEffect(() => {
    if (user) config.set({ ...config.get(), userId: user.id });
  }, [user]);

  React.useEffect(() => {
    if (ready && !authenticated && isInMiniApp) {
      const login = async () => {
        const { nonce } = await initLoginToMiniApp();
        const result = await miniappSdk.actions.signIn({ nonce: nonce });
        // --
        await loginToMiniApp({ message: result.message, signature: result.signature });
      };

      login();
    }
  }, [ready, authenticated, isInMiniApp]);

  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center h-dvh w-full">
        <Loader />
      </div>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      {children}
    </WagmiProvider>
  );
}
