import { base } from 'wagmi/chains';
import { http, createConfig } from 'wagmi';
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { RPC_URL } from '../constants';

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [miniAppConnector()],
  transports: {
    [base.id]: http(RPC_URL),
  },
});
