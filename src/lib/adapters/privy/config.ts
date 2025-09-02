import { type PrivyClientConfig } from '@privy-io/react-auth';
import { base } from 'wagmi/chains';

export const privyConfig: PrivyClientConfig = {
  defaultChain: base,
  supportedChains: [base],
  loginMethodsAndOrder: {
    primary: ['base_account', 'coinbase_wallet', 'detected_wallets'],
  },
  appearance: {
    theme: 'dark',
    walletChainType: 'ethereum-only',
    walletList: ['detected_wallets', 'base_account', 'coinbase_wallet'],
    loginMessage: 'Continue to ZoraCore',
    logo: 'https://zorabot.vercel.app/farcaster/splash-transparent.png',
  },
};
