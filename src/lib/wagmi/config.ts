import { base } from 'wagmi/chains';
import { http, createConfig } from 'wagmi';
import { RPC_URL } from '../constants';

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(RPC_URL),
  },
});
