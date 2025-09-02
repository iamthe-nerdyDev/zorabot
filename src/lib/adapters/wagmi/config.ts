import { base } from 'wagmi/chains';
import { http } from 'wagmi';
import { createConfig } from '@privy-io/wagmi';
import { baseAccount } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [base],
  ssr: true,
  transports: {
    [base.id]: http(),
  },
  connectors: [
    baseAccount({
      appName: 'ZoraCore',
    }),
  ],
});
