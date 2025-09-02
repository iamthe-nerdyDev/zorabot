import { base } from 'wagmi/chains';
import { http } from 'wagmi';
import { createConfig } from '@privy-io/wagmi';

export const wagmiConfig = createConfig({
  chains: [base],
  ssr: true,
  transports: {
    [base.id]: http(),
  },
});
