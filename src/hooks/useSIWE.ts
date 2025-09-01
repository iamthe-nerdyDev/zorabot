'use client';

import React from 'react';
import { useApp } from './useApp';
import { useAccount, useChainId, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';

export default function () {
  const app = useApp();
  const chainId = useChainId();
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  const signIn = async (params?: {
    onSuccess?: (args: { address: string }) => void;
    onError?: (args: { error: Error }) => void;
  }) => {
    if (!address || !chainId) return;
    setIsSigningIn(true);

    try {
      const nonce = await app.getNonce();
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in with Ethereum to the app.',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce: nonce ?? undefined,
      });

      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      await app.siwe(message, signature);
      params?.onSuccess?.({ address });
    } catch (error) {
      params?.onError?.({ error: error as Error });
    } finally {
      setIsSigningIn(false);
    }
  };

  return { signIn, isSigningIn };
}
