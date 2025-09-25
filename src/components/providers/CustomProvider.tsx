'use client';

import React, { type PropsWithChildren } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Loader } from '../global/Loader';
import miniappSdk from '@farcaster/miniapp-sdk';
import { useLoginToMiniApp } from '@privy-io/react-auth/farcaster';

export default function CustomProvider({ children }: PropsWithChildren) {
  const { ready, authenticated } = usePrivy();
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
        // --
        miniappSdk.actions.addMiniApp().catch((e) => console.error(e));
      }

      setIsSDKLoaded(true);
    }

    init();
  }, [isSDKLoaded]);

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

  return children;
}
