import { PROTOCOL_LOGO } from '@/lib/constants';
import { type PrivyClientConfig } from '@privy-io/react-auth';
import { chains } from '../wagmi/config';

export const privyConfig: PrivyClientConfig = {
  defaultChain: chains[0],
  supportedChains: chains,
  loginMethodsAndOrder: {
    primary: ['base_account', 'coinbase_wallet', 'detected_wallets'],
  },
  appearance: {
    theme: 'dark',
    walletChainType: 'ethereum-only',
    walletList: ['detected_wallets', 'base_account', 'coinbase_wallet'],
    loginMessage: 'Continue to ZoraCore',
    logo: PROTOCOL_LOGO,
  },
};
