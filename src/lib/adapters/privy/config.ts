import { type PrivyClientConfig } from '@privy-io/react-auth';
import { base } from 'wagmi/chains';

export const privyConfig: PrivyClientConfig = {
  defaultChain: base,
  supportedChains: [base],
  appearance: {
    theme: 'dark',
    walletChainType: 'ethereum-only',
    walletList: ['detected_wallets'],
    logo: 'https://zorabot.vercel.app/logo.png',
  },
};
