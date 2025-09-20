import { base } from 'wagmi/chains';
import { http } from 'wagmi';
import { createConfig } from '@privy-io/wagmi';
import { baseAccount } from 'wagmi/connectors';
import { createClient } from 'viem';

export const connectors = [baseAccount({ appName: 'ZoraCore' })];

export const wagmiConfig = createConfig({
  chains: [base],
  ssr: true,
  connectors,
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});
