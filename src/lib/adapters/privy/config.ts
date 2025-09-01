import { type PrivyClientConfig } from '@privy-io/react-auth';
import { base } from 'viem/chains';

export const privyConfig: PrivyClientConfig = {
  defaultChain: base,
  supportedChains: [base],
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets',
    },
  },
  appearance: {
    theme: 'dark',
    walletChainType: 'ethereum-only',
    logo: 'https://zorabot.vercel.app/logo.png',
  },
};
